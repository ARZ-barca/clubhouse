const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcryptjs");

require("dotenv").config();

const mongodbURL = process.env.MONGODB;

const User = require("./models/user");

const indexRouter = require("./routes/index");

const app = express();

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongodbURL);
}

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = User.findOne({ username: username });
      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (passwordMatch) {
          // correct
          return done(null, user);
        }
        return done(null, false, { message: "incorrect password" });
      }
      return done(null, false, { message: "incorrect username" });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, { id: user.id, admin: user.admin, member: user.member });
});

passport.deserializeUser(async (user, done) => {
  done(null, user);
});

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, maxAge: 24 * 60 * 60 * 1000 /* a day */ },
  })
);

app.use(passport.initialize());
app.use(passport.authenticate("session"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
