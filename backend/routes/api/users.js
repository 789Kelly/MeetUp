const express = require("express");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const {
  Group,
  Image,
  Membership,
  sequelize,
  User,
} = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateSignup = [
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required"),
  check("email")
    .exists({ checkFalsy: true })
    .withMessage("User already exists")
    .isEmail()
    .withMessage("Invalid email"),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

const router = express.Router();

router.post("/signup", validateSignup, async (req, res) => {
  let { firstName, lastName, email, username, password } = req.body;
  const user = await User.signup({
    firstName,
    lastName,
    email,
    username,
    password,
  });

  const token = await setTokenCookie(res, user);
  const id = user.id;
  firstName = user.firstName;
  lastName = user.lastName;
  email = user.email;

  return res.json({
    id,
    firstName,
    lastName,
    email,
    token,
  });
});

router.get("/users/current/groups", requireAuth, async (req, res) => {
  const { user } = req;

  const Groups = await Group.findAll({
    include: [
      {
        model: User,
        attributes: [],
        where: {
          id: user.id,
        },
      },
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
    group: [
      "Group.id",
      "Images.url",
      "Users.Membership.status",
      "Users.Membership.userId",
      "Users.Membership.groupId",
      "Users.Membership.createdAt",
      "Users.Membership.updatedAt",
    ],
  });

  return res.json({
    Groups,
  });
});

module.exports = router;
