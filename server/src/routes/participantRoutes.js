const express = require("express");
const multer = require("multer");
const {
  uploadExcel,
  getParticipants,
  getTeamParticipants,
  markMealEaten,
} = require("../controllers/participantController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Wrapper
const asyncHandler = (fn) => (req, res, next) => {
  if (typeof fn !== "function") {
    console.error("❌ asyncHandler received non-function:", fn);
    return res.status(500).json({ error: "Invalid route handler" });
  }
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes
router.post(
  "/upload-excel",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err);
        return res.status(400).json({ error: "File upload failed" });
      }
      next();
    });
  },
  asyncHandler(uploadExcel)
);

router.get("/logs", asyncHandler(getParticipants));

// ✅ New route for a specific team
router.get("/team/:teamName", asyncHandler(getTeamParticipants));

// ✅ New route for QR scan marking meal as eaten
router.post("/scan", asyncHandler(markMealEaten));

// ✅ New route for single participant details
router.get("/:id", asyncHandler(require("../controllers/participantController").getParticipantById));

// ✅ New route for team members in an event
router.get("/event/:event_id/team/:team_name", asyncHandler(require("../controllers/participantController").getTeamMembersByEvent));

// ✅ New routes for meal schedule and manual toggle
router.get("/:id/meals", asyncHandler(require("../controllers/participantController").getParticipantMealStatus));
router.post("/:id/toggle-meal/:meal_id", asyncHandler(require("../controllers/participantController").toggleMealScan));

// ✅ New routes for manual CRUD (Add/Delete)
router.post("/add-manual", asyncHandler(require("../controllers/participantController").addManualParticipant));
router.delete("/:id", asyncHandler(require("../controllers/participantController").deleteParticipant));
router.delete("/event/:event_id/team/:team_name", asyncHandler(require("../controllers/participantController").deleteTeam));

module.exports = router;
