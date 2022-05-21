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

  const Attendees = event.Users;

  return res.json({
    Attendees,
  });
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
  const Events = await Event.findAll();
  res.json({
    Events,
  });
});

module.exports = router;
