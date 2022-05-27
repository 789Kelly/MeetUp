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
const membership = require("../../db/models/membership");

const validateGroup = [
  check("name")
    .isLength({ max: 60 })
    .withMessage("Name must be 60 characters or less"),
  check("about")
    .isLength({ min: 50 })
    .withMessage("About must be 50 characters or more"),
  check("type")
    .isIn(["Online", "In person"])
    .withMessage("Type must be Online or In person"),
  check("private")
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

router.put(
  "/:groupId/memberships/:membershipId",
  requireAuth,
  async (req, res) => {
    const { groupId, membershipId } = req.params;
    const { memberId, status } = req.body;
    const { user } = req;

    const group = await Group.findByPk(groupId);
    const membership = await Membership.findByPk(membershipId);

    if (!group) {
      res.status(404);
      return res.json({
        message: "Group couldn't be found",
        statusCode: 404,
      });
    }

    if (!membership) {
      res.status(404);
      return res.json({
        message: "Membership between the user and the group does not exist",
        statusCode: 404,
      });
    }

    if (user.id !== group.organizerId && membership.status !== "co-host") {
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

    if (user.id === group.organizerId) {
      membership.update({
        groupId,
        memberId,
        status,
      });
    }

    return res.json(membership);
  }
);

router.delete(
  "/:groupId/memberships/:membershipId",
  requireAuth,
  async (req, res) => {
    const { groupId, membershipId } = req.params;
    const { user } = req;

    const group = await Group.findByPk(groupId);
    const membership = await Membership.findByPk(membershipId);

    if (!group) {
      res.status(404);
      return res.json({
        message: "Group couldn't be found",
        statusCode: 404,
      });
    }

    if (
      user.id !== group.organizerId &&
      membership.status !== "co-host" &&
      membership.userId !== user.Id
    ) {
      res.status(403);
      return res.json({
        message: "Forbidden",
        statusCode: 403,
      });
    } else {
      await membership.destroy();

      return res.json({
        message: "Successfully deleted membership from group",
      });
    }
  }
);

router.post("/:groupId/images", requireAuth, async (req, res) => {
  const { user } = req;
  const { groupId } = req.params;
  const { url } = req.body;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const membership = await Membership.findAll({
    where: {
      userId: user.id,
      groupId,
    },
  });

  if (user.id === group.organizerId || membership.status === "co-host") {
    const newImage = await Image.create({
      groupId,
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

  newMembership.dataValues.memberId = user.id;
  delete newMembership.dataValues.userId;

  groupId = newMembership.groupId;

  return res.json(newMembership);
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
      [sequelize.col("Images.url"), "previewImage"],
    ],
    group: ["Event.id"],
  });

  return res.json({
    Events,
  });
});

router.post("/:groupId/events", requireAuth, async (req, res) => {
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
        attributes: [],
        where: {
          userId: user.id,
        },
      },
    ],
  });

  let membership = group.Memberships[0];
  let newEvent = {};

  if (user.id === group.organizerId || membership.status === "co-host") {
    newEvent = await Event.create({
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

    return res.json(newEvent);
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.post("/:groupId/venues", requireAuth, async (req, res) => {
  const { user } = req;
  let { address, city, state, lat, lng } = req.body;
  let { groupId } = req.params;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const membership = await Membership.findByPk(groupId);

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
});

router.get("/:groupId", async (req, res) => {
  const groupById = await Group.findByPk(req.params.groupId);

  if (!groupById) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const Organizer = await User.findByPk(groupById.organizerId);

  res.status(200);
  return res.json({
    groupById,
    Organizer,
  });
});

router.put("/:groupId", requireAuth, async (req, res) => {
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
  }

  return res.json(group);
});

router.delete("/:groupId", requireAuth, async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId);

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  await group.destroy();

  return res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
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
    group: ["Group.id"],
  });
  return res.json({
    Groups,
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { name, organizerId, about, type, private, city, state } = req.body;

  const newGroup = await Group.create({
    name,
    organizerId,
    about,
    type,
    private,
    city,
    state,
  });

  if (!newGroup) {
    res.status(400);
    return res.json({
      message: "Validation Error",
      statusCode: 400,
    });
  }
  res.status(201);
  return res.json(newGroup);
});

module.exports = router;
