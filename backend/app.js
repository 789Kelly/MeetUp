const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const { environment } = require("./config");
const { ValidationError } = require("sequelize");
const routes = require("./routes");
let isProduction = environment === "production";

const app = express();

app.use(morgan("dev"));

app.use(cookieParser());
app.use(express.json());

const groupRouter = require("./routes/api/groups");
const eventRouter = require("./routes/api/events");
const venueRouter = require("./routes/api/venues");
// const imageRouter = require("./routes/api/images");

app.use("/groups", groupRouter);
app.use("/events", eventRouter);
app.use("/venues", venueRouter);
// app.use("/images", imageRouter);

if (!isProduction) {
  app.use(cors());
}

app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

app.use(routes);

app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});

app.use((err, _req, _res, next) => {
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = "Validation error";
  }
  next(err);
});

app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  const option = {};
  // isProduction = true;
  if (!isProduction) {
    option.stack = err.stack;
  }
  res.json({
    statusCode: res.statusCode,
    message: err.message,
    errors: err.errors,
    ...option,
  });
});

module.exports = app;
