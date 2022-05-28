const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const eventsRouter = require("./events.js");
const groupsRouter = require("./groups.js");
const imagesRouter = require("./images.js");
const venuesRouter = require("./venues.js");

router.use(sessionRouter);

router.use(usersRouter);

router.use(eventsRouter);

router.use(groupsRouter);

router.use(imagesRouter);

router.use(venuesRouter);

router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;
