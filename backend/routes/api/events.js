const express = require("express");

const router = express.Router();

const {
  Attendance,
  Event,
  Group,
  Image,
  Membership,
  sequelize,
  User,
  Venue,
} = require("../../db/models");
const { Op } = require("sequelize");
const { requireAuth } = require("../../utils/auth");

router.delete(
  "/:eventId/attendances/:attendanceId",
  requireAuth,
  async (req, res) => {
    const { user } = req;
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Attendance,
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

    let attendance = event.Attendances[0];

    const group = await Group.findByPk(event.groupId);

    const membership = await Membership.findOne({
      where: {
        userId: user.id,
        groupId: group.id,
      },
    });

    if (
      user.id === group.organizerId ||
      membership.status === "co-host" ||
      attendance.userId === user.id
    ) {
      await attendance.destroy();
      return res.json({
        message: "Successfully deleted attendance from event",
      });
    } else {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }
  }
);

router.put("/:eventId/attendance", requireAuth, async (req, res) => {
  const { user } = req;
  const { userId, status } = req.body;
  const { eventId } = req.params;

  if (status === "pending") {
    res.status(400);
    return res.json({
      message: "Cannot change an attendance status to pending",
      statusCode: 400,
    });
  }

  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: Group,
        as: "Group",
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

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  let attendance = await Attendance.findOne({
    where: {
      userId,
      eventId,
    },
  });

  if (!attendance) {
    res.status(404);
    return res.json({
      message: "Attendance between the user and the event does not exist",
      statusCode: 404,
    });
  }

  const group = event.Group;
  const membership = event.Group.Memberships;

  if (user.id === group.organizerId || membership.status === "co-host") {
    const updatedAttendance = await attendance.update({
      userId,
      status,
    });

    let id = updatedAttendance.id;
    eventId = updatedAttendance.eventId;
    userId = updatedAttendance.userId;
    status = updatedAttendance.status;
    return res.json({
      id,
      eventId,
      userId,
      status,
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.post("/:eventId/attendances", requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const { user } = req;
  //find all where event id and user id - if exists then throw error
  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: Attendance,
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

  const pendingAttendance = await Attendance.findOne({
    where: {
      eventId,
      userId: user.id,
      status: "pending",
    },
  });

  if (pendingAttendance) {
    res.status(400);
    return res.json({
      message: "Attendance has already been requested",
      statusCode: 400,
    });
  }

  const memberAttendance = await Attendance.findOne({
    where: {
      eventId,
      userId: user.id,
      status: "member",
    },
  });

  if (memberAttendance) {
    res.status(400);
    return res.json({
      message: "User is already an attendee of the event",
      statusCode: 400,
    });
  }

  const group = await Group.findByPk(event.groupId, {
    include: [
      {
        model: Membership,
        where: {
          userId: user.id,
        },
      },
    ],
  });

  const membership = group.Memberships;

  if (membership.status === "member" || membership.status === "co-host") {
    const newAttendance = await Attendance.create({
      eventId,
      userId: user.id,
      status: "pending",
    });

    eventId = newAttendance.eventId;
    let userId = newAttendance.userId;
    let status = newAttendance.status;
    return res.json({
      eventId,
      userId,
      status,
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.post("/:eventId/images", requireAuth, async (req, res) => {
  const { user } = req;
  const { eventId } = req.params;
  const { url } = req.body;

  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: Group,
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

  const membership = await Membership.findAll({
    where: {
      userId: user.id,
      groupId: event.Groups[0].id,
    },
  });

  if (
    user.id === event.Groups[0].organizerId ||
    membership.status === "co-host"
  ) {
    const newImage = await Image.create({
      eventId,
      url,
    });
    return res.json(newImage);
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.get("/:eventId/attendees", requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const { user } = req;

  const event = await Event.findByPk(eventId);

  const group = await Group.findByPk(event.groupId, {
    include: [
      {
        model: Membership,
        where: {
          userId: user.id,
        },
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

  // return res.json(group);

  const membership = group.Memberships[0];
  let Attendees;

  if (group.organizerId === user.id || membership.status === "co-host") {
    Attendees = await User.findAll({
      attributes: ["id", "firstName", "lastName"],
      include: [
        {
          model: Attendance,
          as: "Attendance",
          where: {
            eventId: event.id,
          },
          attributes: ["status"],
        },
      ],
    });
  } else {
    Attendees = await User.findAll({
      attributes: ["id", "firstName", "lastName"],
      include: [
        {
          model: Attendance,
          as: "Attendance",
          attributes: ["status"],
          where: {
            eventId: event.id,
            [Op.or]: [{ status: "member" }, { status: "waitlist" }],
          },
        },
      ],
    });
  }

  return res.json({
    Attendees,
  });
});

router.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: Attendance,
        attributes: [],
      },
      {
        model: Group,
        as: "Group",
        attributes: ["id", "name", "private", "city", "state"],
      },
      {
        model: Venue,
        as: "Venue",
        attributes: ["id", "address", "city", "state", "lat", "lng"],
      },
      {
        model: Image,
        as: "images",
        attributes: ["url"],
      },
    ],
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "description",
      "type",
      "capacity",
      "price",
      "startDate",
      "endDate",
      [sequelize.fn("COUNT", sequelize.col("Attendances.id")), "numAttending"],
    ],
    group: ["Event.id"],
  });

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  res.json(event);
});

// router.put("/:eventId", requireAuth, async (req, res) => {
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
//   const { eventId } = req.params;

//   const venue = await Venue.findByPk(venueId);

//   const event = await Event.findByPk(eventId, {
//     attributes: ["id", "groupId", "venueId", "name", "type", "capacity", "price", "description", "startDate", "endDate"],
//     include: [
//       {
//         model: Group,
//         include: [
//           {
//           model: Membership,
//           where: {
//             userId: user.id,
//           },
//           }
//         ]
//       },
//     ],
//   });

//   if (!venue) {
//     res.status(404);
//     return res.json({
//       message: "Venue couldn't be found",
//       statusCode: 404,
//   }

//   if (!event) {
//         res.status(404);
//     return res.json({
//       message: "Event couldn't be found",
//       statusCode: 404,
//   }

//   const group = event.Groups[0];
//   const membership = event.Groups[0].Memberships[0];

//   if (user.id === group.organizerId || membership.status === "co-host") {
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

router.delete("/:eventId", requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const { user } = req;

  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: Group,
        include: [
          {
            model: Membership,
          },
        ],
      },
    ],
  });

  // const group = await Group.findByPk(event.groupId);

  const group = event.Groups[0];
  const membership = group.Memberships[0];

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === group.organizerId || membership.status === "co-host") {
    await event.destroy();

    return res.json({
      message: "Successfully deleted",
      statusCode: 200,
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.get("/", async (req, res) => {
  let { name, type, startDate, page, size } = req.query;

  let where = {};

  if (name && name !== "") {
    where.name = name;
  }

  if (type && type !== "" && (type === "Online" || type === "In Person")) {
    where.type = type;
  }

  if (type !== "Online" || type !== "In Person") {
    res.statusCode = 400;
    return res.json({
      message: "Validation Error",
      statusCode: 400,
      errors: {
        type: "Type must be 'Online' or 'In Person'",
      },
    });
  }

  if (startDate && startDate !== "") {
    where.startDate = startDate;
  }

  page = parseInt(page);
  size = parseInt(size);

  if (Number.isNaN(page) || page < 0 || page > 10) {
    page = 0;
    res.status = 400;
    return res.json({
      message: "Validation Error",
      statusCode: 400,
      errors: {
        page: "Page must be greater than or equal to 0",
      },
    });
  }

  if (Number.isNaN(size) || size < 0 || size > 20) {
    size = 20;
    res.status = 400;
    return res.json({
      message: "Validation Error",
      statusCode: 400,
      errors: {
        size: "Size must be greater than or equal to 0",
      },
    });
  }

  const Events = await Event.findAll({
    where,
    limit: size,
    offset: size * (page - 1),
  });

  return res.json({
    Events,
  });
});

module.exports = router;
