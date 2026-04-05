// const db = require("../config/db");

// // 📌 Create Event
// exports.createEvent = async (req, res) => {
//   const { event_name, start_date, end_date } = req.body;

//   if (!event_name || !start_date || !end_date) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const [result] = await db.execute(
//       `INSERT INTO events (event_name, start_date, end_date) VALUES (?, ?, ?)`,
//       [event_name, start_date, end_date]
//     );

//     res.status(201).json({
//       message: "🎉 Event Created Successfully!",
//       event_id: result.insertId,
//     });
//   } catch (error) {
//     console.error("❌ Database Error:", error);
//     res.status(500).json({ message: "Database Insert Failed", error });
//   }
// };


// // 📌 Fetch All Events
// exports.getEvents = async (req, res) => {
//   try {
//     const [rows] = await db.execute(`SELECT * FROM events`);
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("❌ Fetch Error:", error);
//     res.status(500).json({ message: "Database Fetch Failed", error });
//   }
// };


// // 📌 Fetch Single Event WITH Meals
// exports.getEventDetails = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [event] = await db.execute(
//       `SELECT * FROM events WHERE event_id = ?`,
//       [id]
//     );

//     if (event.length === 0) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     const [meals] = await db.execute(
//         `SELECT 
//     DATE(date) AS date,
//     meal_name,
//     start_time,
//     end_time
//   FROM event_meals
//   WHERE event_id = ?
//   ORDER BY DATE(date), start_time
// `,
//       [id]
//     );

//     const mealDays = meals.reduce((acc, row) => {
//       // ✅ NORMALIZE DATE (IMPORTANT FIX)
//       const formattedDate = row.date.toISOString().split("T")[0];

//       if (!acc[formattedDate]) {
//         acc[formattedDate] = { date: formattedDate, meals: [] };
//       }

//       acc[formattedDate].meals.push({
//         meal_name: row.meal_name,
//         start_time: row.start_time,
//         end_time: row.end_time,
//       });

//       return acc;
//     }, {});

//     res.status(200).json({
//       event: event[0],
//       meals: Object.values(mealDays),
//     });

//   } catch (error) {
//     console.error("❌ Fetch Event Details Error:", error);
//     res.status(500).json({ error: "Failed to fetch event details" });
//   }
// };



// // 📌 Toggle Enable/Disable Event
// exports.toggleEvent = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await db.execute(
//       `UPDATE events SET enabled = NOT enabled WHERE event_id = ?`,
//       [id]
//     );
//     res.status(200).json({ message: "Event status toggled successfully" });
//   } catch (error) {
//     console.error("❌ Toggle Error:", error);
//     res.status(500).json({ error: "Failed to toggle event" });
//   }
// };


// // 🌟 SAVE ALL MEALS FOR A DATE
// exports.saveAllMeals = async (req, res) => {
//   const { id } = req.params;
//   const { date, meals } = req.body;

//   if (!date || !meals || meals.length === 0) {
//     return res.status(400).json({ message: "Date and at least one meal is required" });
//   }

//   try {
//     await db.execute(
//       `DELETE FROM event_meals WHERE event_id = ? AND date = ?`,
//       [id, date]
//     );

//     for (let meal of meals) {
//       await db.execute(
//         `INSERT INTO event_meals (event_id, date, meal_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)`,
//         [
//           id,
//           date,
//           meal.meal_name.trim().toLowerCase(), // ✅ HERE
//           meal.start_time,
//           meal.end_time
//         ]
//       );
//     }

//     const [updatedMeals] = await db.execute(
//       `SELECT meal_id, event_id, date, meal_name, start_time, end_time 
//        FROM event_meals 
//        WHERE event_id = ?
//        ORDER BY date, start_time`,
//       [id]
//     );

//     res.status(200).json({
//       message: "Meals saved successfully!",
//       updatedMeals,
//     });
//   } catch (error) {
//     console.error("❌ Meal Save Error:", error);
//     res.status(500).json({ error: "Error saving meals" });
//   }
// };



// // 📌 Get only Meals for an Event (Optional API - used in EventDetails.jsx or Edit page)
// exports.getEventMeals = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [meals] = await db.execute(
//       `SELECT meal_id, date, meal_name, start_time, end_time
//        FROM event_meals
//        WHERE event_id = ?
//        ORDER BY date, start_time`,
//       [id]
//     );

//     res.status(200).json(meals);
//   } catch (error) {
//     console.error("❌ Fetch Meals Error:", error);
//     res.status(500).json({ error: "Failed to fetch meals" });
//   }
// };

// const db = require("../config/db");


// // 📌 Create Event
// exports.createEvent = async (req, res) => {
//   const { event_name, start_date, end_date } = req.body;

//   if (!event_name || !start_date || !end_date) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const [result] = await db.execute(
//       `INSERT INTO events (event_name, start_date, end_date)
//        VALUES (?, ?, ?)`,
//       [event_name, start_date, end_date]
//     );

//     res.status(201).json({
//       message: "🎉 Event Created Successfully!",
//       event_id: result.insertId,
//     });
//   } catch (error) {
//     console.error("❌ Database Error:", error);
//     res.status(500).json({ message: "Database Insert Failed", error });
//   }
// };


// // 📌 Fetch All Events
// exports.getEvents = async (req, res) => {
//   try {
//     const [rows] = await db.execute(`SELECT * FROM events`);
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("❌ Fetch Error:", error);
//     res.status(500).json({ message: "Database Fetch Failed", error });
//   }
// };


// // 📌 Fetch Single Event WITH Meals ✅ FINAL
// exports.getEventDetails = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [event] = await db.execute(
//       `SELECT * FROM events WHERE event_id = ?`,
//       [id]
//     );

//     if (event.length === 0) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     const [meals] = await db.execute(
//       `SELECT 
//         DATE(date) AS date,
//         meal_name,
//         start_time,
//         end_time
//        FROM event_meals
//        WHERE event_id = ?
//        ORDER BY DATE(date), start_time`,
//       [id]
//     );

//     const mealDays = meals.reduce((acc, row) => {
//       if (!acc[row.date]) {
//         acc[row.date] = { date: row.date, meals: [] };
//       }

//       acc[row.date].meals.push({
//         meal_name: row.meal_name,
//         start_time: row.start_time,
//         end_time: row.end_time,
//       });

//       return acc;
//     }, {});

//     res.status(200).json({
//       event: event[0],
//       meals: Object.values(mealDays),
//     });

//   } catch (error) {
//     console.error("❌ Fetch Event Details Error:", error);
//     res.status(500).json({ error: "Failed to fetch event details" });
//   }
// };


// // 📌 Enable / Disable Event
// exports.toggleEvent = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await db.execute(
//       `UPDATE events SET enabled = NOT enabled WHERE event_id = ?`,
//       [id]
//     );
//     res.status(200).json({ message: "Event status toggled successfully" });
//   } catch (error) {
//     console.error("❌ Toggle Error:", error);
//     res.status(500).json({ error: "Failed to toggle event" });
//   }
// };


// // 🌟 Save All Meals for a Date ✅ FINAL
// exports.saveAllMeals = async (req, res) => {
//   const { id } = req.params;
//   const { date, meals } = req.body;

//   if (!date || !meals || meals.length === 0) {
//     return res
//       .status(400)
//       .json({ message: "Date and at least one meal is required" });
//   }

//   try {
//     // ✅ Remove existing meals for that day
//     await db.execute(
//       `DELETE FROM event_meals WHERE event_id = ? AND DATE(date) = ?`,
//       [id, date]
//     );

//     for (let meal of meals) {
//       // ✅ Prevent empty meals
//       if (!meal.meal_name || !meal.start_time || !meal.end_time) continue;

//       await db.execute(
//         `INSERT INTO event_meals 
//          (event_id, date, meal_name, start_time, end_time)
//          VALUES (?, ?, ?, ?, ?)`,
//         [
//           id,
//           `${date} 00:00:00`,                 // ✅ TIMEZONE FIX
//           meal.meal_name.trim().toLowerCase(), // ✅ CLEAN NAME
//           meal.start_time,
//           meal.end_time
//         ]
//       );
//     }

//     res.status(200).json({ message: "✅ Meals saved successfully!" });

//   } catch (error) {
//     console.error("❌ Meal Save Error:", error);
//     res.status(500).json({ error: "Error saving meals" });
//   }
// };


// // 📌 Get Only Meals (Optional)
// exports.getEventMeals = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [meals] = await db.execute(
//       `SELECT 
//         DATE_FORMAT(date, '%Y-%m-%d') AS date,
//         meal_name,
//         start_time,
//         end_time
//        FROM event_meals
//        WHERE event_id = ?
//        ORDER BY DATE(date), start_time`,
//       [id]
//     );

//     res.status(200).json(meals);
//   } catch (error) {
//     console.error("❌ Fetch Meals Error:", error);
//     res.status(500).json({ error: "Failed to fetch meals" });
//   }
// };


const db = require("../config/db");

/* =======================
   CREATE EVENT
======================= */
exports.createEvent = async (req, res) => {
  const { event_name, start_date, end_date } = req.body;

  if (!event_name || !start_date || !end_date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(start_date);
  const end = new Date(end_date);

  if (start < today) {
    return res.status(400).json({ message: "Start date cannot be in the past" });
  }

  if (end < start) {
    return res.status(400).json({ message: "End date cannot be before start date" });
  }

  try {
    const [existing] = await db.execute(
      "SELECT event_id FROM events WHERE LOWER(event_name) = LOWER(?)",
      [event_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "An event with this name already exists" });
    }

    const [result] = await db.execute(
      `INSERT INTO events (event_name, start_date, end_date)
       VALUES (?, ?, ?)`,
      [event_name, start_date, end_date]
    );

    res.status(201).json({
      message: "Event created successfully",
      event_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};


/* =======================
   UPDATE EVENT
======================= */
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { event_name, start_date, end_date } = req.body;

  if (!event_name || !start_date || !end_date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if another event has same name
    const [existing] = await db.execute(
      "SELECT event_id FROM events WHERE LOWER(event_name) = LOWER(?) AND event_id != ?",
      [event_name, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "An event with this name already exists" });
    }

    await db.execute(
      `UPDATE events SET event_name = ?, start_date = ?, end_date = ? WHERE event_id = ?`,
      [event_name, start_date, end_date, id]
    );

    res.status(200).json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};


/* =======================
   FETCH ALL EVENTS
======================= */
exports.getEvents = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM events`);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fetch failed" });
  }
};


/* =======================
   FETCH EVENT + MEALS ✅ FINAL
======================= */
exports.getEventDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const [event] = await db.execute(
      `SELECT * FROM events WHERE event_id = ?`,
      [id]
    );

    if (!event.length) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ FORCE DATE AS STRING (NO TIMEZONE)
    const [meals] = await db.execute(
      `SELECT 
         meal_id,
         DATE_FORMAT(date, '%Y-%m-%d') AS date,
         meal_name,
         start_time,
         end_time
       FROM event_meals
       WHERE event_id = ?
       ORDER BY date, start_time`,
      [id]
    );

    const mealDays = meals.reduce((acc, row) => {
      if (!acc[row.date]) {
        acc[row.date] = { date: row.date, meals: [] };
      }

      acc[row.date].meals.push({
        meal_id: row.meal_id,
        meal_name: row.meal_name,
        start_time: row.start_time,
        end_time: row.end_time,
      });

      return acc;
    }, {});

    res.status(200).json({
      event: event[0],
      meals: Object.values(mealDays),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch event details" });
  }
};


/* =======================
   TOGGLE EVENT STATUS
======================= */
exports.toggleEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute(
      `UPDATE events SET enabled = NOT enabled WHERE event_id = ?`,
      [id]
    );
    res.status(200).json({ message: "Event status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Toggle failed" });
  }
};


/* =======================
   SAVE MEALS ✅ FINAL
======================= */
exports.saveAllMeals = async (req, res) => {
  const { id } = req.params;
  const { date, meals } = req.body;

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  const mealList = meals || [];

  if (mealList.length > 5) {
    return res.status(400).json({ message: "Maximum 5 meals per day allowed" });
  }

  try {
    // 1. Get existing meals for this date from the DB
    const [existing] = await db.execute(
      "SELECT meal_id FROM event_meals WHERE event_id = ? AND date = ?",
      [id, date]
    );
    const existingIds = existing.map(m => m.meal_id);
    const incomingIds = mealList.filter(m => m.meal_id).map(m => m.meal_id);
    
    // 2. Identify meals to DELETE (in DB but not in request)
    const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
    if (toDelete.length > 0) {
      await db.execute(
        `DELETE FROM event_meals WHERE meal_id IN (${toDelete.join(',')})`
      );
    }

    // 3. Process each meal (Update or Insert)
    for (const meal of mealList) {
      const name = meal.meal_name.trim().toLowerCase();
      if (!name || !meal.start_time || !meal.end_time) continue;

      if (meal.meal_id && existingIds.includes(meal.meal_id)) {
        // UPDATE existing
        await db.execute(
          `UPDATE event_meals SET meal_name = ?, start_time = ?, end_time = ? WHERE meal_id = ?`,
          [name, meal.start_time, meal.end_time, meal.meal_id]
        );
      } else {
        // INSERT new
        await db.execute(
          `INSERT INTO event_meals (event_id, date, meal_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)`,
          [id, date, name, meal.start_time, meal.end_time]
        );
      }
    }

    res.status(200).json({ message: "Meals synced successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Saving meals failed" });
  }
};


/* =======================
   GET MEALS ONLY (OPTIONAL)
======================= */
exports.getEventMeals = async (req, res) => {
  const { id } = req.params;

  try {
    const [meals] = await db.execute(
      `SELECT 
         meal_id,
         DATE_FORMAT(date, '%Y-%m-%d') AS date,
         meal_name,
         start_time,
         end_time
       FROM event_meals
       WHERE event_id = ?
       ORDER BY date, start_time`,
      [id]
    );

    res.status(200).json(meals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Meal fetch failed" });
  }
};


/* =======================
   DELETE EVENT
======================= */
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete child records first to avoid FK constraint errors
    await db.execute(`DELETE FROM event_meals WHERE event_id = ?`, [id]);
    await db.execute(`DELETE FROM participants WHERE event_id = ?`, [id]);

    const [result] = await db.execute(
      `DELETE FROM events WHERE event_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ deleteEvent error:", error);
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};
