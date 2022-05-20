const express = require("express");
const router = express.Router();

const { Event } = require("../../db/models");

router.get("/", async (req, res) => {
  const eveents = await Event.findAll();
  res.json(events);
});

module.exports = router;
