const express = require("express");
const router = express.Router();

const { Group, Event, User } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// router.get("/:eventId/attendees", requireAuth, async (req, res) => {
//   const { eventId } = req.params;
//   // const { user } = req;

//   const event = await Event.findByPk(eventId, {
//     include: [
//       {
//         model: User,
//       },
//     ],
//   });

//   const group = await Group.findByPk(event.groupId);

//   if (!event) {
//     res.status(404);
//     return res.json({
//       message: "Event couldn't be found",
//       statusCode: 404,
//     });
//   }

//   const Attendees = event.Users;

//     if (group.organizerId === user.id) {
//       return res.json({
//         Attendees,
//       });
//     }
// });

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

// router.put("/:id", requireAuth, async (req, res) => {
//   const { user } = req;
//   const {
//     venueId,
//     name,
//     type,
//     capacity,
//     price,
//     description,
//     startDate,
//     endDate,
//   } = req.body;
//   const { id } = req.params;

//   const venue = await Venue.findByPk(venueId);

//   const event = await Event.findByPk(id, {
//     include: [
//       {
//         model: Group,
//       },
//     ],
//   });

//   // if (!venue) {
//   //   res.status(404);
//   //   return res.json({
//   //     message: "Venue couldn't be found",
//   //     statusCode: 404,
//   // }

//   if (!event) {
//         res.status(404);
//     return res.json({
//       message: "Event couldn't be found",
//       statusCode: 404,
//   }

//   if (user.id === Group.organizerId) {
//     await event.update({
//       groupId,
//       venueId,
//       name,
//       type,
//       capacity,
//       price,
//       description,
//       startDate,
//       endDate,
//     });
//   }

//   return res.json(event);
// });

router.post("/:id", requireAuth, async (req, res) => {
  const { eventId, userId, status } = req.body;
  const { id } = req.params;
  const { user } = req;
  //find all where event id and user id - if exists then throw error
  const event = await Event.findByPk(id, {
    include: [
      {
        model: Attendance,
      },
    ],
  });

  let newAttendance = {};

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === userId) {
    newAttendance = await Attendance.create({
      eventId,
      userId,
      status,
    });
  }

  return res.json(newAttendance);
});

// router.delete("/:eventId", requireAuth, async (req, res) => {
//   const { eventId } = req.params;
//   const { user } = req;

//   const event = await Event.findByPk(eventId,
//     include:
//     model: Group);
//   const group = await Group.findByPk(event.groupId);

//   if (!event) {
//     res.status(404);
//     return res.json({
//       message: "Event couldn't be found",
//       statusCode: 404,
//     });
//   }

//   if (user.id === group.organizerId) {
//     await event.destroy();
//   }

//   return res.json({
//     message: "Successfully deleted",
//     statusCode: 200,
//   });
// });

router.get("/", async (req, res) => {
  const Events = await Event.findAll();
  res.json({
    Events,
  });
});

module.exports = router;
