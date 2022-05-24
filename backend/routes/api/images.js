const express = require("express");
const router = express.Router();

const { Event, Group, Image, Membership } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

router.delete("/images/:imageId", requireAuth, async (req, res) => {
  const { user } = req;
  const { imageId } = req.params;

  const image = await Image.findByPk(imageId, {
    include: [
      {
        model: Group,
        model: Event,
      },
    ],
  });

  let group = image.Groups[0];
  let event = image.Events[0];

  if (!image) {
    res.status(404);
    return res.json({
      message: "Image couldn't be found",
      statusCode: 404,
    });
  }

  if (!image.Events) {
    const membership = await Membership.findAll({
      where: {
        userId: user.id,
        groupId: group.id,
      },
    });
    if (user.id === group.organizerId || membership.status === "co-host") {
      await image.destroy();
      res.status(200);
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
  }

  if (!image.Groups) {
    group = await Group.findByPk(event.groupId, {
      include: [
        {
          model: Membership,
        },
      ],
    });
    if (
      user.id === group.organizerId ||
      group.Memberships[0].status === "co-host"
    ) {
      await image.destroy();
      res.status(200);
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
  }
});

module.exports = router;
