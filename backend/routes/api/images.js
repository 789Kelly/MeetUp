const express = require("express");
const router = express.Router();

const { Event, Group, Image, Membership } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

router.delete("/:imageId", requireAuth, async (req, res) => {
  const { user } = req;
  const { imageId } = req.params;

  const image = await Image.findByPk(imageId, {
    include: [
      {
        model: Group,
      },
      {
        model: Event,
      },
    ],
  });

  if (!image) {
    res.status(404);
    return res.json({
      message: "Image couldn't be found",
      statusCode: 404,
    });
  }

  let group = image.Group;
  let event = image.Event;

  if (!event) {
    const membership = await Membership.findOne({
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

  if (!group) {
    group = await Group.findByPk(event.groupId, {
      include: [
        {
          model: Membership,
          where: {
            userId: user.id,
          },
        },
      ],
    });

    const membership = group.Memberships[0];
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
});

module.exports = router;
