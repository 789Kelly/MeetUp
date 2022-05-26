const express = require("express");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { Group, Membership, User } = require("../../db/models");
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
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
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

  // const current = await User.findByPk(user.id, {
  //   include: [
  //     {
  //       model: Group,
  //     },
  //   ],
  // });

  // const Groups = current.Groups;

  // const membership = await Membership.findAll({
  //   where: {
  //     userId: user.id,
  //   },
  //   include: [
  //     {
  //       model: Group,
  //     },
  //   ],
  // });

  const Groups = await Group.findAll({
    include: [
      {
        model: User,
        where: {
          id: user.id,
        },
        attributes: [],
        through: {
          attributes: [],
        },
      },
    ],
  });

  return res.json({
    Groups,
  });
});

module.exports = router;
