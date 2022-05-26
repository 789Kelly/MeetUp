const express = require("express");

const router = express.Router();

const {
  Event,
  Group,
  Image,
  Membership,
  User,
  Venue,
  sequelize,
} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

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

router.post("/groups/:groupId/images", requireAuth, async (req, res) => {
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

router.get("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;
  // const { user } = req;

  const group = await Group.findByPk(groupId, {
    include: [
      {
        model: User,
      },
    ],
  });

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const Members = group.Users;

  return res.json({
    Members,
  });
});

router.post("/:groupId/members", requireAuth, async (req, res) => {
  const { memberId, status } = req.body;
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId);

  const newMembership = await Membership.create({
    groupId,
    memberId,
    status,
  });

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  return res.json(newMembership);
});

router.get("/:groupId/events", async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId, {
    include: [
      {
        model: Event,
      },
    ],
  });

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  const Events = group.Events;

  return res.json({
    Events,
  });
});

router.post("/:groupId/events", requireAuth, async (req, res) => {
  const { user } = req;
  const {
    venueId,
    name,
    type,
    capacity,
    price,
    description,
    startDate,
    endDate,
  } = req.body;
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId);
  const venue = await Venue.findByPk(venueId);
  let newEvent = {};

  if (user.id === group.organizerId) {
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
  }

  if (!venue) {
    res.status(404);
    return res.json({
      message: "Venue couldn't be found",
      statusCode: 404,
    });
  }

  return res.json(newEvent);
});

router.post("/:groupId/venues", requireAuth, async (req, res) => {
  const { user } = req;
  const { address, city, state, lat, lng } = req.body;
  const { groupId } = req.params;

  const group = await Group.findByPk(groupId);

  if (user.id === group.organizerId) {
    const newVenue = await Venue.create({
      groupId,
      address,
      city,
      state,
      lat,
      lng,
    });
  }

  if (!group) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  return res.json(newVenue);
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

router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, about, type, private, city, state } = req.body;
  const { user } = req;

  const group = await Group.findByPk(id);

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

router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  const group = await Group.findByPk(id);

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
    //   attributes: {
    //     include: [
    //       [
    //         sequelize.fn("COUNT", sequelize.col("Memberships.groupId")),
    //         "numMembers",
    //       ],
    //     ],
    //   },
    //   include: {
    //     model: Membership,
    //     attributes: [],
    //   },
    //   include: {
    //     model: Image,
    //     attributes: [url],
    //   },
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
