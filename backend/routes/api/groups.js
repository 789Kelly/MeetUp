const express = require("express");

const router = express.Router();

const {
  Attendance,
  Event,
  Group,
  Image,
  Membership,
  User,
  Venue,
  sequelize,
} = require("../../db/models");
const { Op } = require("sequelize");
const { requireAuth } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateGroup = [
  check("name")
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be 60 characters or less"),
  check("about")
    .isLength({ min: 50 })
    .withMessage("About must be 50 characters or more"),
  check("type")
    .isIn(["Online", "In person"])
    .withMessage("Type must be Online or In person"),
  check("private").isBoolean().withMessage("Private must be a boolean"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  handleValidationErrors,
];

const validateVenue = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("lat")
    .isFloat({ min: -90.0, max: 90.0 })
    .withMessage("Latitude is not valid"),
  check("lng")
    .isFloat({ min: -180.0, max: 180.0 })
    .withMessage("Longitude is not valid"),
  handleValidationErrors,
];

const validateEvent = [
  check("venueId").custom(async (value, { req }) => {
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

router.put("/:groupId/members/:memberId", requireAuth, async (req, res) => {
  let { groupId, memberId } = req.params;
  let { status } = req.body;
  const { user } = req;

  const group = await Group.findByPk(groupId);

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

  const memberMembership = await Membership.findOne({
    where: {
      userId: memberId,
      groupId: group.id,
    },
    attributes: ["id", "groupId", ["userId", "memberId"], "status"],
  });

  if (!membership) {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }

  if (status === "co-host" && user.id !== group.organizerId) {
    res.status(403);
    return res.json({
      message: "Current user must be the organizer to add a co-host",
      statusCode: 403,
    });
  }

  if (
    status === "member" &&
    user.id !== group.organizerId &&
    membership.status !== "co-host"
  ) {
    res.status(400);
    return res.json({
      message:
        "Current user must be the organizer or a co-host to make someone a member",
      statusCode: 400,
    });
  }

  if (status === "pending") {
    res.status(400);
    return res.json({
      message: "Cannot change a membership status to pending",
      statusCode: 400,
    });
  }

  if (!memberMembership) {
    res.status(404);
    return res.json({
      message: "Membership between the user and the group does not exist",
      statusCode: 404,
    });
  }

  if (user.id === group.organizerId || membership.status === "co-host") {
    memberMembership.update({
      userId: memberId,
      status,
    });

    delete memberMembership.dataValues.createdAt;
    delete memberMembership.dataValues.updatedAt;
    delete memberMembership.dataValues.userId;

    return res.json(memberMembership);
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.delete("/:groupId/members/:memberId", requireAuth, async (req, res) => {
  const { groupId, memberId } = req.params;
  const { user } = req;

  const group = await Group.findByPk(groupId);

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
      groupId,
    },
  });

  if (!membership) {
    {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }
  }

  const memberMembership = await Membership.findOne({
    where: {
      userId: memberId,
    },
  });

  if (!memberMembership) {
    res.status(404);
    return res.json({
      message: "Membership couldn't be found",
      statusCode: 404,
    });
  }

  if (
    user.id === group.organizerId ||
    membership.status === "co-host" ||
    membership.userId === user.Id
  ) {
    await memberMembership.destroy();

    return res.json({
      message: "Successfully deleted membership from group",
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.post("/:groupId/images", requireAuth, async (req, res) => {
  const { user } = req;
  let { groupId } = req.params;
  let { url } = req.body;

  groupId = parseInt(groupId);
  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === group.organizerId) {
    const newImage = await Image.create({
      groupId,
      url,
    });

    let id = newImage.id;
    groupId = newImage.groupId;
    url = newImage.url;

    return res.json({
      id,
      groupId,
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

router.get("/:groupId/members", requireAuth, async (req, res) => {
  const { groupId } = req.params;
  const { user } = req;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === group.organizerId) {
    const Members = await User.findAll({
      attributes: ["id", "firstName", "lastName"],
      include: [
        {
          model: Membership,
          as: "Membership",
          where: {
            groupId,
          },
          attributes: ["status"],
        },
      ],
    });

    return res.json({
      Members,
    });
  } else {
    const Members = await User.findAll({
      attributes: ["id", "firstName", "lastName"],
      include: [
        {
          model: Membership,
          as: "Membership",
          where: {
            groupId,
            [Op.or]: [{ status: "member" }, { status: "co-host" }],
          },
          attributes: ["status"],
        },
      ],
    });

    return res.json({
      Members,
    });
  }
});

router.post("/:groupId/memberships", requireAuth, async (req, res) => {
  let { groupId } = req.params;
  const { user } = req;

  groupId = parseInt(groupId);
  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const pendingMembership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId,
      status: "pending",
    },
  });

  if (pendingMembership) {
    res.status(400);
    return res.json({
      message: "Membership has already been requested",
      statusCode: 400,
    });
  }

  const membership = await Membership.findOne({
    where: {
      userId: user.id,
      groupId,
      [Op.or]: [{ status: "member" }, { status: "co-host" }],
    },
  });

  if (membership) {
    res.status(400);
    return res.json({
      message: "User is already a member of the group",
      statusCode: 400,
    });
  }

  const newMembership = await Membership.create({
    groupId,
    userId: user.id,
    status: "pending",
  });

  groupId = newMembership.groupId;
  let memberId = newMembership.userId;
  let status = newMembership.status;

  return res.json({
    groupId,
    memberId,
    status,
  });
});

router.get("/:groupId/events", async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const Events = await Event.findAll({
    include: [
      {
        model: Attendance,
        attributes: [],
      },
      {
        model: Image,
        as: "images",
        attributes: [],
      },
      {
        model: Group,
        as: "Group",
        where: {
          id: groupId,
        },
        attributes: ["id", "name", "city", "state"],
      },
      {
        model: Venue,
        as: "Venue",
        attributes: ["id", "city", "state"],
      },
    ],
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "type",
      "startDate",
      [sequelize.fn("COUNT", sequelize.col("Attendances.id")), "numAttending"],
      [sequelize.col("images.url"), "previewImage"],
    ],
    group: [
      "Event.id",
      "images.url",
      "Group.id",
      "Group.name",
      "Group.city",
      "Group.state",
      "Venue.id",
      "Venue.city",
      "Venue.state",
    ],
  });

  return res.json({
    Events,
  });
});

router.post(
  "/:groupId/events",
  requireAuth,
  validateEvent,
  async (req, res) => {
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
    let { groupId } = req.params;

    groupId = parseInt(groupId);
    const venue = await Venue.findByPk(venueId);

    if (!venue) {
      res.status(404);
      return res.json({
        message: "Venue couldn't be found",
        statusCode: 404,
      });
    }

    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: Membership,
          where: {
            userId: user.id,
          },
        },
      ],
    });

    if (!group) {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }

    let membership = group.Memberships[0];

    if (!membership) {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    }

    if (user.id === group.organizerId || membership.status === "co-host") {
      let newEvent = await Event.create({
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

      const id = newEvent.id;
      groupId = newEvent.groupId;
      venueId = newEvent.venueId;
      name = newEvent.name;
      type = newEvent.type;
      capacity = newEvent.capacity;
      price = newEvent.price;
      description = newEvent.description;
      startDate = newEvent.startDate;
      endDate = newEvent.endDate;
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
  }
);

router.post(
  "/:groupId/venues",
  requireAuth,
  validateVenue,
  async (req, res) => {
    const { user } = req;
    let { address, city, state, lat, lng } = req.body;
    let { groupId } = req.params;

    groupId = parseInt(groupId);
    const group = await Group.findByPk(groupId);

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
      const newVenue = await Venue.create({
        groupId,
        address,
        city,
        state,
        lat,
        lng,
      });

      let id = newVenue.id;
      groupId = newVenue.groupId;
      address = newVenue.address;
      city = newVenue.city;
      state = newVenue.state;
      lat = newVenue.lat;
      lng = newVenue.lng;

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
  }
);

router.get("/:groupId", async (req, res) => {
  let { groupId } = req.params;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const imager = group.id;
  const organizer = group.organizerId;
  const venuer = group.id;

  console.log("here");

  const Groups = await Group.findByPk(groupId, {
    include: [
      {
        model: Membership,
        attributes: [],
      },
      {
        model: Image,
        attributes: ["id", "imageableId", "url"],
        where: {
          imageableId: imager,
          imageableType: "group",
        },
      },
      {
        model: User,
        as: "Organizer",
        attributes: ["id", "firstName", "lastName"],
        where: {
          id: organizer,
        },
        through: {
          attributes: [],
        },
      },
      {
        model: Venue,
        attributes: ["id", "groupId", "address", "city", "state", "lat", "lng"],
        where: {
          groupId: venuer,
        },
      },
    ],
    attributes: [
      "id",
      "organizerId",
      "name",
      "about",
      "type",
      "private",
      "city",
      "state",
      "createdAt",
      "updatedAt",
      [sequelize.fn("COUNT", sequelize.col("Memberships.id")), "numMembers"],
    ],
    group: [
      "Group.id",
      "Images.id",
      //   "Images.url",
      //   "Organizer.id",
      //   "Organizer.Membership.status",
      //   "Organizer.Membership.userId",
      //   "Organizer.Membership.groupId",
      //   "Organizer.Membership.createdAt",
      //   "Organizer.Membership.updatedAt",
    ],
  });

  // let id = Groups.id;
  // let organizerId = Groups.organizerId;
  // let name = Groups.name;
  // let about = Groups.about;
  // let type = Groups.type;
  // let private = Groups.private;
  // let city = Groups.city;
  // let state = Groups.state;
  // let createdAt = Groups.createdAt;
  // let updatedAt = Groups.updatedAt;
  // numMembers = Groups.numMembers;

  return res.json(Groups);
});

router.put("/:groupId", requireAuth, validateGroup, async (req, res) => {
  const { groupId } = req.params;
  const { name, about, type, private, city, state } = req.body;
  const { user } = req;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === group.organizerId) {
    await group.update({
      name,
      about,
      type,
      private,
      city,
      state,
    });

    return res.json(group);
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.delete("/:groupId", requireAuth, async (req, res) => {
  const { groupId } = req.params;
  const { user } = req;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === group.organizerId) {
    await group.destroy();

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
  const Groups = await Group.findAll({
    include: [
      {
        model: Membership,
        attributes: [],
      },
      {
        model: Image,
        attributes: [],
      },
    ],
    attributes: [
      "id",
      "organizerId",
      "name",
      "about",
      "type",
      "private",
      "city",
      "state",
      "createdAt",
      "updatedAt",
      [sequelize.fn("COUNT", sequelize.col("Memberships.id")), "numMembers"],
      [sequelize.col("Images.url"), "previewImage"],
    ],
    group: ["Group.id", "Images.url"],
  });
  return res.json({
    Groups,
  });
});

router.post("/", requireAuth, validateGroup, async (req, res) => {
  const { name, about, type, private, city, state } = req.body;
  const { user } = req;

  const newGroup = await Group.create({
    name,
    organizerId: user.id,
    about,
    type,
    private,
    city,
    state,
  });

  res.status(201);
  return res.json(newGroup);
});

module.exports = router;
