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
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateEvent = [
  check("venueId").custom(async (value) => {
    const venue = await Venue.findByPk(value);
    if (!venue) {
      return Promise.reject("Venue does not exist");
    }
  }),
  check("name")
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters"),
  check("type")
    .isIn(["Online", "In person"])
    .withMessage("Type must be Online or In person"),
  check("capacity").isInt().withMessage("Capacity must be an integer"),
  check("price").isFloat({ min: 0.1 }).withMessage("Price is invalid"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("startDate").isAfter().withMessage("Start date must be in the future"),
  check("endDate")
    .custom((value, { req }) => value > req.body.startDate)
    .withMessage("End date is less than start date"),
  handleValidationErrors,
];

const validateQuery = [
  check("page")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Page must be greater than or equal to 0"),
  check("size")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Size must be greater than or equal to 0"),
  check("name")
    .optional({ nullable: true })
    .isString()
    .withMessage("Name must be a string"),
  check("type")
    .optional({ nullable: true })
    .isIn(["Online", "In person"])
    .withMessage("Type must be 'Online' or 'In person'"),
  check("startDate")
    .optional({ nullable: true })
    .isDate()
    .withMessage("Start date must be a valid datetime"),
  handleValidationErrors,
];

const mapEvents = async (events) => {
  events.forEach((event) => {
    event.dataValues.previewImage = event.dataValues.Images.map((image) => {
      return image.url;
    });
    delete event.dataValues.Images;
  });
  for await (const event of events) {
    const attendance = await Attendance.findAll({
      where: {
        eventId: event.id,
      },
    });
    event.dataValues.numAttending = attendance.length;
  }
  return events;
};

router.delete(
  "/:eventId/attendances/:attendeeId",
  requireAuth,
  async (req, res) => {
    const { user } = req;
    const { eventId, attendeeId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      res.status(404);
      return res.json({
        message: "Event couldn't be found",
        statusCode: 404,
      });
    }

    const attendance = await Attendance.findOne({
      where: {
        userId: attendeeId,
        eventId,
      },
    });

    if (!attendance) {
      res.status(404);
      return res.json({
        message: "Attendance couldn't be found",
        statusCode: 404,
      });
    }

    const group = await Group.findByPk(event.groupId);

    if (!group) {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }

    const membership = await Membership.findOne({
      where: {
        userId: user.id,
        groupId: group.id,
      },
    });

    if (!membership) {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }

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

router.put(
  "/:eventId/attendances/:attendeeId",
  requireAuth,
  async (req, res) => {
    const { user } = req;
    let { userId, status } = req.body;
    let { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      res.status(404);
      return res.json({
        message: "Event couldn't be found",
        statusCode: 404,
      });
    }

    if (status === "pending") {
      res.status(400);
      return res.json({
        message: "Cannot change an attendance status to pending",
        statusCode: 400,
      });
    }

    let attendance = await Attendance.findOne({
      where: {
        userId,
        eventId,
      },
      attributes: ["id", "status", "userId", "eventId"],
    });

    if (!attendance) {
      res.status(404);
      return res.json({
        message: "Attendance between the user and the event does not exist",
        statusCode: 404,
      });
    }

    const group = await Group.findByPk(event.groupId);

    if (!group) {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }

    const membership = await Membership.findOne({
      where: {
        userId: user.id,
        groupId: group.id,
      },
    });

    if (user.id === group.organizerId || membership.status === "co-host") {
      attendance.update({
        userId,
        status,
      });

      delete attendance.dataValues.createdAt;
      delete attendance.dataValues.updatedAt;

      return res.json(attendance);
    } else {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }
  }
);

router.post("/:eventId/attendances", requireAuth, async (req, res) => {
  let { eventId } = req.params;
  const { user } = req;
  //find all where event id and user id - if exists then throw error

  eventId = parseInt(eventId);
  const event = await Event.findByPk(eventId);

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
      [Op.or]: [{ status: "member" }, { status: "co-host" }],
    },
  });

  if (memberAttendance) {
    res.status(400);
    return res.json({
      message: "User is already an attendee of the event",
      statusCode: 400,
    });
  }

  const group = await Group.findByPk(event.groupId);

  if (!group) {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }

  let membership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: group.id,
    },
  });

  if (!membership) {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }

  if (membership.status === "member" || membership.status === "co-host") {
    let newAttendance = await Attendance.create({
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
  let { eventId } = req.params;
  let { url } = req.body;

  eventId = parseInt(eventId);

  const event = await Event.findByPk(eventId);

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  const attendance = await Attendance.findOne({
    where: {
      eventId: event.id,
      userId: user.id,
    },
  });

  if (!attendance) {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }

  if (attendance.status === "member" || attendance.status === "co-host") {
    const newImage = await Image.create({
      imageableId: eventId,
      imageableType: "event",
      url,
    });

    let id = newImage.id;
    imageableId = newImage.imageableId;
    url = newImage.url;

    return res.json({
      id,
      imageableId,
      url,
    });
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

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  const group = await Group.findByPk(event.groupId);

  const membership = await Membership.findOne({
    where: {
      groupId: group.id,
      userId: user.id,
    },
  });

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
            [Op.or]: [
              { status: "member" },
              { status: "waitlist" },
              { status: "co-host" },
            ],
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

  const eVent = await Event.findByPk(eventId);

  if (!eVent) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

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
        attributes: ["id", "imageableId", "url"],
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
    group: ["Event.id", "Group.id", "Venue.id", "Images.id"],
  });

  res.json(event);
});

router.put("/:eventId", requireAuth, validateEvent, async (req, res) => {
  const { user } = req;
  let {
    venueId,
    name,
    type,
    capacity,
    price,
    description,
    startDate,
    endDate,
  } = req.body;
  const { eventId } = req.params;

  const venue = await Venue.findByPk(venueId);

  const event = await Event.findByPk(eventId);

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  const group = await Group.findOne({
    where: {
      id: event.groupId,
    },
  });

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const membership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: group.id,
    },
  });

  if (!membership) {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }

  if (user.id === group.organizerId || membership.status === "co-host") {
    const updatedEvent = await event.update({
      venueId,
      name,
      type,
      capacity,
      price,
      description,
      startDate,
      endDate,
    });

    let id = updatedEvent.id;
    let groupId = updatedEvent.groupId;
    venueId = updatedEvent.venueId;
    name = updatedEvent.name;
    type = updatedEvent.type;
    capacity = updatedEvent.capacity;
    price = updatedEvent.price;
    description = updatedEvent.description;
    startDate = updatedEvent.startDate;
    endDate = updatedEvent.endDate;

    return res.json({
      id,
      groupId,
      venueId,
      name,
      type,
      capacity,
      price,
      description,
      startDate,
      endDate,
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.delete("/:eventId", requireAuth, async (req, res) => {
  const { eventId } = req.params;
  const { user } = req;

  const event = await Event.findByPk(eventId);

  if (!event) {
    res.status(404);
    return res.json({
      message: "Event couldn't be found",
      statusCode: 404,
    });
  }

  const group = await Group.findByPk(event.groupId);

  if (!group) {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }

  const membership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId: group.id,
    },
  });

  if (user.id === group.organizerId || membership.status === "co-host") {
    await event.destroy();

    return res.json({
      message: "Successfully deleted",
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.get("/", validateQuery, async (req, res) => {
  let { name, type, startDate, page, size } = req.query;

  let where = {};
  let pagination = {};

  if (!page) {
    page = 0;
  }

  if (!size) {
    size = 20;
  }

  if (Number.isNaN(page) || page < 0 || page > 10) {
    page = 0;
  } else {
    page = page;
  }

  if (Number.isNaN(size) || size < 0 || size > 20) {
    size = 20;
  } else {
    size = size;
  }

  if (page > 0) {
    pagination.limit = size;
    pagination.offset = size * (page - 1);
  } else {
    pagination.limit = size;
  }

  if (name) {
    where.name = name;
  }

  if (startDate) {
    const date = new Date(startDate);
    const lastDate = date.setDate(date.getDate() + 1);
    where.startDate = { [Op.between]: [startDate, lastDate] };
  }

  if (type === "Online" || type === "In person") {
    where.type = type;
  }

  let events = await Event.findAll({
    include: [
      {
        model: Attendance,
        attributes: [],
      },
      {
        model: Group,
        as: "Group",
        attributes: ["id", "name", "city", "state"],
      },
      {
        model: Venue,
        as: "Venue",
        attributes: ["id", "city", "state"],
      },
      {
        model: Image,
        attributes: ["url"],
      },
    ],
    attributes: {
      exclude: [
        "description",
        "capacity",
        "price",
        "endDate",
        "createdAt",
        "updatedAt",
      ],
    },
    group: ["Event.id"],
    where: { ...where },
    ...pagination,
  });
  const eventAggregates = await mapEvents(events);
  console.log(eventAggregates);
  return res.json({
    Events: eventAggregates,
  });
});

module.exports = router;
