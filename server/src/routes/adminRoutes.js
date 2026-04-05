const express = require("express");
const router = express.Router();
const { 
  getGlobalStats, 
  getAllUsers, 
  updateUser,
  updateUserRole, 
  deleteUser 
} = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authmiddleware");

// Middleware to ONLY allow Super Admins
const verifySuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "super admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Super Admin privileges required." });
  }
};

// 📊 Dashboard Stats
router.get("/stats", verifyToken, verifySuperAdmin, getGlobalStats);

// 👥 User Management
router.get("/users", verifyToken, verifySuperAdmin, getAllUsers);
router.put("/users/:id", verifyToken, verifySuperAdmin, updateUser);
router.put("/users/:id/role", verifyToken, verifySuperAdmin, updateUserRole);
router.delete("/users/:id", verifyToken, verifySuperAdmin, deleteUser);

module.exports = router;
