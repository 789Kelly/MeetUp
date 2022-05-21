const express = require("express");
const router = express.Router();

const { Event } = require("../../db/models");

// router.get("/:eventId/attendees", async (req, res) => {
//   const { eventId } = req.params;

//   const event = await Event.findByPk(eventId, {
//     include: [
//       {
//         model: User,
//       },
//     ],
//   });

//   return res.json(event);
// });

router.get("/:id", async (req, res) => {
  const eventById = await Event.findByPk(req.params.id);
  res.json(eventById);
});

router.get("/", async (req, res) => {
  const events = await Event.findAll();
  res.json(events);
});

module.exports = router;
