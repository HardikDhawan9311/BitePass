const express = require("express");
const router = express.Router();
const { 
  createEvent, 
  getEvents, 
  getEventDetails, 
  toggleEvent, 
  updateEvent,
  saveAllMeals,
  getEventMeals,
  deleteEvent
} = require("../controllers/eventController");

// Create Event
router.post("/create", createEvent);

// Get all events
router.get("/", getEvents);

// Get event details (includes meals)
router.get("/:id", getEventDetails);

// Update event details
router.put("/:id", updateEvent);

// Get only meals for event (optional API)
router.get("/:id/meals", getEventMeals);   // ⭐ Add this

// Toggle event status
router.put("/:id/toggle", toggleEvent);

// Save all meals for one date
router.post("/:id/meals/saveAll", saveAllMeals);

// Delete event
router.delete("/:id", deleteEvent);

module.exports = router;
