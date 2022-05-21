const express = require("express");

const router = express.Router();

const { Group, User, Event } = require("../../db/models");

router.get("/:groupId/members", async (req, res) => {
  const { groupId } = req.params;

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

router.get("/:id", async (req, res) => {
  const groupById = await Group.findByPk(req.params.id);

  if (!groupById) {
    res.status(404);
    return res.json({
      message: "Group couldn't be found",
      statusCode: 404,
    });
  }

  res.json(groupById);
});

router.get("/", async (req, res) => {
  const Groups = await Group.findAll();
  res.json({
    Groups,
  });
});

module.exports = router;
