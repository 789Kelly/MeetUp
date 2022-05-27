const express = require("express");

const router = express.Router();

const { Group, Membership, Venue } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

router.get("/:venueId", requireAuth, async (req, res) => {
  const { user } = req;
  let { address, city, state, lat, lng } = req.body;
  let { venueId } = req.params;

  const venue = await Venue.findByPk(venueId, {
    attributes: ["groupId", "address", "city", "state", "lat", "lng"],
    include: [
      {
        model: Group,
        include: [
          {
            model: Membership,
            as: "Memberships",
            where: {
              userId: user.id,
            },
          },
        ],
      },
    ],
  });

  if (!venue) {
    res.status(404);
    return res.json({
      message: "Venue couldn't be found",
      statusCode: 404,
    });
  }

  console.log(venue);

  return res.json(venue);

  const group = venue.Groups[0];
  const membership = venue.Groups[0].Memberships[0];

  if (user.id === group.organizerId || membership.status === "co-host") {
    const updatedVenue = await Venue.update({
      groupId: group.id,
      address,
      city,
      state,
      lat,
      lng,
    });

    let id = updatedVenue.id;
    let groupId = updatedVenue.groupId;
    address = updatedVenue.address;
    city = updatedVenue.city;
    state = updatedVenue.state;
    lat = updatedVenue.lat;
    lng = updatedVenue.lng;

    return res.json({
      id,
      groupId,
      address,
      city,
      state,
      lat,
      lng,
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

module.exports = router;
