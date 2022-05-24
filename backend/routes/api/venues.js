const express = require("express");

const router = express.Router();

const { Group, Venue } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

router.put("/venues/:venueId", requireAuth, async (req, res) => {
  const { user } = req;
  const { groupId, address, city, state, lat, lng } = req.body;
  const { venueId } = req.params;

  const group = await Group.findByPk(groupId);
  const venue = await Venue.findByPk(venueId);

  if (user.id === group.organizerId) {
    venue.update({
      groupId,
      address,
      city,
      state,
      lat,
      lng,
    });
  }

  if (!venue) {
    res.status(404);
    return res.json({
      message: "Venue couldn't be found",
      statusCode: 404,
    });
  }

  return res.json(newVenue);
});

module.exports = router;
