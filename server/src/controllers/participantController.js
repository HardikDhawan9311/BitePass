const xlsx = require("xlsx");
const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { nanoid } = require("nanoid");

// 🔹 Upload Excel, insert data, generate tokens
const uploadExcel = async (req, res) => {
  try {
    const { event_id } = req.body;
    console.log("📥 Uploading Excel for event_id:", event_id);
    if (!event_id) {
      return res.status(400).json({ error: "event_id is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({ error: "Excel file is empty or invalid" });
    }

    let sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: null,
      raw: false,
    });

    console.log("📊 First row of raw sheetData:", JSON.stringify(sheetData[0], null, 2));

    if (sheetData.length === 0) {
      return res.status(400).json({ error: "Excel sheet has no rows" });
    }

    const normalize = (key) => key.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    const requiredHeaders = ["teamname", "name", "email", "checkin"];
    const fileHeaders = Object.keys(sheetData[0]).map(normalize);

    const missingHeaders = requiredHeaders.filter((h) => !fileHeaders.includes(h));

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: "Invalid Excel format",
        expectedHeaders: requiredHeaders,
        missingHeaders,
      });
    }

    // Normalize all rows
    sheetData = sheetData.map((row) => {
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[normalize(key)] = row[key];
      }
      return normalizedRow;
    });

    let insertCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 🔹 Insert rows one by one in a transaction
      for (let [index, row] of sheetData.entries()) {
        const { teamname, name, email, checkin } = row;

        if (!teamname || !name || !email || !checkin) {
          console.warn(`⚠️ Missing fields in row ${index + 2}, skipping...`);
          errorCount++;
          continue;
        }

        try {
          const eid = parseInt(event_id);
          const nameVal = name ? name.toString().trim() : "";
          const teamVal = teamname ? teamname.toString().trim() : "";

          // 🔹 More robust duplicate check
          const [existing] = await connection.execute(
            "SELECT id FROM participants WHERE event_id = ? AND LOWER(TRIM(name)) = LOWER(?) AND LOWER(TRIM(team_name)) = LOWER(?)",
            [eid, nameVal, teamVal]
          );

          if (existing.length > 0) {
            console.log(`⚠️ Duplicate found for ${nameVal} in team ${teamVal}. Skipping...`);
            duplicateCount++;
            continue;
          }

          const token_id = nanoid(21);
          const isCheckedIn = (checkin?.toString().toLowerCase().trim() === "yes") ? 1 : 0;
          
          console.log(`📝 Inserting row ${index + 2}: ${nameVal} (${email})`);
          const [result] = await connection.execute(
            "INSERT INTO participants (event_id, team_name, name, email, check_in, token_id) VALUES (?, ?, ?, ?, ?, ?)",
            [eid, teamVal, nameVal, email, isCheckedIn, token_id]
          );

          if (result.affectedRows > 0) {
            insertCount++;
            console.log(`✅ Row ${index + 2} affectRows: ${result.affectedRows}`);
          } else {
            console.log(`⚠️ Insertion failed for ${teamname} - ${email}`);
          }
        } catch (err) {
          console.error(`❌ DB Error in row ${index + 2}:`, err);
          errorCount++;
        }
      }
      
      await connection.commit();
    } catch (transactionErr) {
      await connection.rollback();
      throw transactionErr;
    } finally {
      connection.release();
    }

    // ✅ Delete uploaded file
    const absolutePath = path.resolve(filePath);
    fs.unlink(absolutePath, (err) => {
      if (err) console.error("⚠️ Failed to delete uploaded file:", err.message);
      else console.log("🗑️ Uploaded file deleted:", absolutePath);
    });

    // ✅ Final response
    let message = "Excel processed successfully";
    if (duplicateCount > 0 && insertCount === 0 && errorCount === 0) {
      message = "Duplicate participants found";
    } else if (errorCount > 0 && insertCount === 0) {
      message = "Error uploading participants";
    } else if (duplicateCount > 0 || errorCount > 0) {
      message = `Processed: ${insertCount} added, ${duplicateCount} duplicates skipped, ${errorCount} errors.`;
    }

    res.json({
      message,
      inserted: insertCount,
      duplicates: duplicateCount,
      errors: errorCount,
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Server error while processing Excel file" });
  }
};

// 🔹 Fetch all participants
const getParticipants = async (req, res) => {
  try {
    const { event_id } = req.query;
    let query = "SELECT * FROM participants";
    let params = [];

    if (event_id) {
      query += " WHERE event_id = ?";
      params.push(event_id);
    }

    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (error) {
    console.error("❌ getParticipants error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Fetch participants by team
const getTeamParticipants = async (req, res) => {
  try {
    const { teamName } = req.params;

    if (!teamName) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const [results] = await db.execute(
      "SELECT * FROM participants WHERE LOWER(REPLACE(team_name, ' ', '')) = LOWER(REPLACE(?, ' ', ''))",
      [teamName]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: `No participants found for team ${teamName}` });
    }

    res.json(results);
  } catch (error) {
    console.error("❌ getTeamParticipants error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Mark meal as eaten via QR Scan — per meal tracking
const markMealEaten = async (req, res) => {
  try {
    const { token_id, event_id, meal_id } = req.body;

    if (!token_id || !event_id || !meal_id) {
      return res.status(400).json({ error: "token_id, event_id, and meal_id are required" });
    }

    // 1. Verify token exists
    const [anyParticipant] = await db.execute(
      "SELECT * FROM participants WHERE token_id = ?",
      [token_id]
    );

    if (anyParticipant.length === 0) {
      return res.status(404).json({ error: "❌ Invalid QR code. Participant not found." });
    }

    const participant = anyParticipant[0];

    // 🚩 NEW: Verify participant belongs to this specific event
    if (participant.event_id !== parseInt(event_id)) {
      return res.status(403).json({
        error: "❌ This QR code belongs to another event.",
      });
    }

    // 3. Verify meal belongs to this event
    const [mealRows] = await db.execute(
      "SELECT * FROM event_meals WHERE meal_id = ? AND event_id = ?",
      [meal_id, event_id]
    );

    if (mealRows.length === 0) {
      return res.status(400).json({ error: "❌ Invalid meal selection for this event." });
    }

    const mealName = mealRows[0].meal_name;

    // 4. Check if this participant already ate this specific meal
    const [existing] = await db.execute(
      "SELECT id FROM meal_scans WHERE participant_id = ? AND meal_id = ?",
      [participant.id, meal_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: `⚠️ ${participant.name} has already collected ${mealName}. Cannot scan again for the same meal.`,
      });
    }

    // 5. Record the meal scan
    await db.execute(
      "INSERT INTO meal_scans (participant_id, meal_id) VALUES (?, ?)",
      [participant.id, meal_id]
    );

    // 6. Update the summary counter on participants
    await db.execute(
      "UPDATE participants SET meals_eaten = meals_eaten + 1 WHERE id = ?",
      [participant.id]
    );

    // 7. Get total meals for this event and how many this participant has eaten
    const [totalMeals] = await db.execute(
      "SELECT COUNT(*) as total FROM event_meals WHERE event_id = ?",
      [event_id]
    );
    const [eatenMeals] = await db.execute(
      "SELECT COUNT(*) as eaten FROM meal_scans WHERE participant_id = ?",
      [participant.id]
    );

    const total = totalMeals[0].total;
    const eaten = eatenMeals[0].eaten;

    res.json({
      message: `✅ ${mealName} recorded for ${participant.name}!`,
      name: participant.name,
      team_name: participant.team_name,
      meal: mealName,
      meals_eaten: eaten,
      total_meals: total,
      summary: `${eaten}/${total} meals collected`,
    });
  } catch (error) {
    // Handle duplicate key gracefully
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "⚠️ This meal has already been scanned for this participant." });
    }
    console.error("❌ markMealEaten error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Fetch single participant by ID
const getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;

    const [results] = await db.execute(
      `SELECT p.*, e.event_name 
       FROM participants p 
       JOIN events e ON p.event_id = e.event_id 
       WHERE p.id = ?`,
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("❌ getParticipantById error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Fetch all participants in a specific team for a specific event
const getTeamMembersByEvent = async (req, res) => {
  try {
    const { event_id, team_name } = req.params;

    const [results] = await db.execute(
      "SELECT id, name, email, check_in, meals_eaten, email_sent, token_id FROM participants WHERE event_id = ? AND LOWER(TRIM(team_name)) = LOWER(TRIM(?))",
      [event_id, team_name]
    );

    res.json(results);
  } catch (error) {
    console.error("❌ getTeamMembersByEvent error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Fetch all meals for an event with scan status for a specific participant
const getParticipantMealStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get participant's event_id
    const [pResult] = await db.execute("SELECT event_id FROM participants WHERE id = ?", [id]);
    if (pResult.length === 0) return res.status(404).json({ error: "Participant not found" });
    const event_id = pResult[0].event_id;

    // 2. Get all meals for this event
    const [allMeals] = await db.execute(
      "SELECT meal_id, meal_name, start_time, end_time, date FROM event_meals WHERE event_id = ? ORDER BY date, start_time",
      [event_id]
    );

    // 3. Get meals already scanned for this participant
    const [scannedMeals] = await db.execute(
      "SELECT meal_id FROM meal_scans WHERE participant_id = ?",
      [id]
    );
    const scannedIds = new Set(scannedMeals.map(m => m.meal_id));

    // 4. Combine data
    const schedule = allMeals.map(meal => ({
      ...meal,
      is_scanned: scannedIds.has(meal.meal_id)
    }));

    res.json(schedule);
  } catch (error) {
    console.error("❌ getParticipantMealStatus error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Manually toggle a meal scan (Grant/Revoke)
const toggleMealScan = async (req, res) => {
  try {
    const { id, meal_id } = req.params;

    // Check if the scan already exists
    const [existing] = await db.execute(
      "SELECT id FROM meal_scans WHERE participant_id = ? AND meal_id = ?",
      [id, meal_id]
    );

    if (existing.length > 0) {
      // DELETE scan and decrement counter
      await db.execute("DELETE FROM meal_scans WHERE participant_id = ? AND meal_id = ?", [id, meal_id]);
      await db.execute("UPDATE participants SET meals_eaten = GREATEST(0, meals_eaten - 1) WHERE id = ?", [id]);
      res.json({ message: "Scan reset successfully", status: "not_scanned" });
    } else {
      // INSERT scan and increment counter
      await db.execute("INSERT INTO meal_scans (participant_id, meal_id) VALUES (?, ?)", [id, meal_id]);
      await db.execute("UPDATE participants SET meals_eaten = meals_eaten + 1 WHERE id = ?", [id]);
      res.json({ message: "Meal marked as scanned", status: "scanned" });
    }
  } catch (error) {
    console.error("❌ toggleMealScan error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { 
  uploadExcel, 
  getParticipants, 
  getTeamParticipants, 
  markMealEaten, 
  getParticipantById, 
  getTeamMembersByEvent,
  getParticipantMealStatus,
  toggleMealScan
};
