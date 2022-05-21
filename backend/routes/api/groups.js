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

  return res.json(group.Users);
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

  return res.json(group.Events);
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
  const groups = await Group.findAll();
  res.json(groups);
});

module.exports = router;
