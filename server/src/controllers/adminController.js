const db = require("../config/db");

// 📊 1. Get Global Stats for Dashboard
const getGlobalStats = async (req, res) => {
  try {
    // Total Events
    const [totalEvents] = await db.execute("SELECT COUNT(*) as count FROM events");
    
    // Upcoming Events (Today or future)
    const [upcomingEvents] = await db.execute("SELECT COUNT(*) as count FROM events WHERE start_date >= CURDATE()");
    
    // Past Events
    const [pastEvents] = await db.execute("SELECT COUNT(*) as count FROM events WHERE end_date < CURDATE()");

    // Total Participants (unique across all events)
    const [totalParticipants] = await db.execute("SELECT COUNT(*) as count FROM participants");

    // Total Scans / Meals Collected
    const [totalScans] = await db.execute("SELECT COUNT(*) as count FROM meal_scans");

    // Monthly Growth (Quick mockup of data for charts)
    const chartData = [
      { name: "Total", count: totalEvents[0].count },
      { name: "Upcoming", count: upcomingEvents[0].count },
      { name: "Past", count: pastEvents[0].count },
    ];

    res.json({
      totalEvents: totalEvents[0].count,
      upcomingEvents: upcomingEvents[0].count,
      pastEvents: pastEvents[0].count,
      totalParticipants: totalParticipants[0].count,
      totalScans: totalScans[0].count,
      chartData
    });
  } catch (error) {
    console.error("❌ getGlobalStats error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 👥 2. Get All Users for User Management
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute("SELECT id, name, username, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json(users);
  } catch (error) {
    console.error("❌ getAllUsers error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 👑 3. Update User Full Profile (Name, Email, Role)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Basic validation
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required." });
    }

    if (!["user", "admin", "super admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    await db.execute(
      "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
      [name, email, role, id]
    );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("❌ updateUser error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 👑 4. Update User Role (Kept for compatibility, though updateUser can handle it)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "super admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    await db.execute("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("❌ updateUserRole error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🗑️ 4. Delete User (Careful!)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion if needed, or just allow it for now
    await db.execute("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ deleteUser error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getGlobalStats,
  getAllUsers,
  updateUser,
  updateUserRole,
  deleteUser
};
