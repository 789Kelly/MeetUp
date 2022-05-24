const express = require("express");

const router = express.Router();

const { Membership } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// router.put(
//   "/memberships/:membershipId",
//   requireAuth,
//   async (req, res) => {
//     const { membershipId } = req.params;
//     const { groupId, memberId, status } = req.body;
//     const { user } = req;

//     const membership = await Membership.findByPk(membershipId);

//     if (!group) {
//       res.status(404);
//       return res.json({
//         message: "Group couldn't be found",
//         statusCode: 404,
//       });
//     }

//     if (!membership) {
//       res.status(404);
//       return res.json({
//         message: "Membership between the user and the group does not exist",
//         statusCode: 404,
//     }

//     if (user.id === group.organizerId) {
//       membership.update({
//         groupId,
//         memberId,
//         status,
//       });
//     }

//     if (status === "co-host" && user.id !== group.organizerId) {
//       res.status(403);
//       return res.json({
//         message: "Current user must be the organizer to add a co-host",
//         statusCode: 403,
//     }

//     if (status === "member" && user.id !== group.organizerId) {
//       res.status(400);
//       return res.json({
//         message: "Current user must be the organizer or a co-host to make someone a member",
//         statusCode: 400,
//     }

//     if (status === "pending") {
//       res.status(400);
//       return res.json({
//         message: "Cannot change a membership status to pending",
//         statusCode: 400,
//     }

//   return res.json(membership);
//   }
// );

router.delete("/memberships/:membershipId", requireAuth, async (req, res) => {
  const { membershipId } = req.params;
  const { user } = req;

  const membership = await Membership.findByPk(membershipId);

  if (!membership) {
    res.status(404);
    return res.json({
      message: "Membership couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id !== membership.userId) {
    await membership.destroy();
  }

  return res.json({
    message: "Successfully deleted membership from group",
  });
});

module.exports = router;
