const express = require("express");
const router = express.Router();

const { Group } = require("../../db/models");

router.get("/:id", async (req, res) => {
  const groupById = await Group.findByPk(req.params.id);
  res.json(groupById);
});

router.get("/", async (req, res) => {
  const groups = await Group.findAll();
  res.json(groups);
});

module.exports = router;
