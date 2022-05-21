const express = require("express");
const router = express.Router();

const { Event, User } = require("../../db/models");

router.get("/:eventId/attendees", async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: User,
      },
    ],
  });

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  return res.json(event.Users);
});

router.get("/:id", async (req, res) => {
  const eventById = await Event.findByPk(req.params.id);

  if (!eventById) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  res.json(eventById);
});

router.get("/", async (req, res) => {
  const events = await Event.findAll();
  res.json(events);
});

module.exports = router;
