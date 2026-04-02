const db = require("./db");

const initTables = async () => {
  try {
    await db.query("SELECT 1");
  } catch (err) {
    console.error("❌ Database connection failed in initTables:", err.message);
    return;
  }

  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS events (
      event_id INT AUTO_INCREMENT PRIMARY KEY,
      event_name VARCHAR(255) UNIQUE NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS event_meals (
      meal_id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      date DATE NOT NULL,
      meal_name VARCHAR(100) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS participants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      team_name VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      check_in BOOLEAN DEFAULT FALSE,
      meals_eaten INT DEFAULT 0,
      email_sent BOOLEAN DEFAULT FALSE,
      token_id VARCHAR(21) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
      INDEX idx_participant_search (event_id, team_name, name),
      INDEX idx_participant_event_email (event_id, email),
      UNIQUE INDEX idx_participant_event_token (event_id, token_id)
    )`,
    // New table: tracks which specific meal each participant has eaten
    `CREATE TABLE IF NOT EXISTS meal_scans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      participant_id INT NOT NULL,
      meal_id INT NOT NULL,
      scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_meal_scan (participant_id, meal_id),
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
      FOREIGN KEY (meal_id) REFERENCES event_meals(meal_id) ON DELETE CASCADE
    )`
  ];

  try {
    for (const query of tableQueries) {
      await db.execute(query);
    }
    console.log("✅ Database Tables Initialized/Verified!");

    // Migration: rename meal_eaten → meals_eaten (INT counter) if needed
    try {
      const [columns] = await db.execute("DESCRIBE participants");
      const columnNames = columns.map(c => c.Field);
      if (columnNames.includes("meal_eaten") && !columnNames.includes("meals_eaten")) {
        await db.execute("ALTER TABLE participants CHANGE meal_eaten meals_eaten INT DEFAULT 0");
        console.log("✅ Migrated: meal_eaten (BOOLEAN) → meals_eaten (INT)");
      } else if (!columnNames.includes("meals_eaten")) {
        await db.execute("ALTER TABLE participants ADD COLUMN meals_eaten INT DEFAULT 0 AFTER check_in");
        console.log("✅ Added meals_eaten column to participants");
      }
      console.log("✅ Database Migrations Verified!");
    } catch (err) {
      console.error("❌ Migration error:", err.message);
    }

    // Migration: Apply schema changes for production (drop qr_code, modify token_id, add indexes)
    try {
      const [columns] = await db.execute("DESCRIBE participants");
      const columnNames = columns.map(c => c.Field);
      
      // 1. Drop qr_code if exists
      if (columnNames.includes("qr_code")) {
        await db.execute("ALTER TABLE participants DROP COLUMN qr_code");
        console.log("✅ Migrated: Dropped qr_code column from participants");
      }

      // 1.5 Ensure token_id is large enough for NanoID (21 chars)
      try {
        await db.execute("ALTER TABLE participants MODIFY token_id VARCHAR(21) UNIQUE NOT NULL");
      } catch (err) {
        console.error("⚠️ Could not modify token_id length:", err.message);
      }

      // 1.7 Add email_sent column if missing
      if (!columnNames.includes("email_sent")) {
        await db.execute("ALTER TABLE participants ADD COLUMN email_sent BOOLEAN DEFAULT FALSE AFTER meals_eaten");
        console.log("✅ Migrated: Added email_sent column to participants");
      }

      // 2. Safely add new indexes (Try-Catch ignores 'Duplicate Key Name' errors)
      const indexesToCreate = [
        "CREATE INDEX idx_participant_search ON participants(event_id, team_name, name)",
        "CREATE INDEX idx_participant_event_email ON participants(event_id, email)",
        "CREATE UNIQUE INDEX idx_participant_event_token ON participants(event_id, token_id)"
      ];

      for (const idxQuery of indexesToCreate) {
        try {
          await db.execute(idxQuery);
          console.log(`✅ Index added successfully: ${idxQuery.split(' ')[2]}`);
        } catch (idxErr) {
          if (idxErr.code !== 'ER_DUP_KEYNAME') {
             console.error(`⚠️ Notice (Index creation): ${idxErr.message}`);
          }
        }
      }
    } catch (err) {
      console.error("❌ Participant schema migration error:", err.message);
    }

    // Migration: add 'role' to users if missing
    try {
      const [columns] = await db.execute("DESCRIBE users");
      const columnNames = columns.map(c => c.Field);
      if (!columnNames.includes("role")) {
        await db.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER password");
        console.log("✅ Added 'role' column to users table");
      }
    } catch (err) {
      console.error("❌ User role migration error:", err.message);
    }

  } catch (error) {
    console.error("❌ Error initializing database tables:", error.message);
  }
};

module.exports = initTables;
