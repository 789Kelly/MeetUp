const express = require("express");

const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth");
const { User } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateLogin = [
  check("credential")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Email is required"),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required"),
  handleValidationErrors,
];

const router = express.Router();

router.post("/login", validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  const user = await User.login({ credential, password });
  // console.log(user);
  if (!user) {
    const err = new Error();
    err.message = "Invalid credentials";
    err.status = 401;
    // err.title = "Login failed";
    // err.errors = ["The provided credentials were invalid."];
    return next(err);
  }

  const token = await setTokenCookie(res, user);
  let id = user.id;
  let firstName = user.firstName;
  let lastName = user.lastName;
  let email = user.email;

  return res.json({
    id,
    firstName,
    lastName,
    email,
    token,
  });
});

router.delete("/", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "success" });
});

router.get("/users/current", restoreUser, requireAuth, (req, res) => {
  const { user } = req;
  if (user) {
    return res.json({
      ...user.toSafeObject(),
    });
  } else return res.json({});
});

module.exports = router;
