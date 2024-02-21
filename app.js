const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const compression = require("compression");
const helmet = require("helmet");

const MongoStore = require("connect-mongo");

const bcrypt = require("bcryptjs");

require("dotenv").config();

const MONGODBURL = process.env.MONGODB;
const MEMBER_PASSWORD = process.env.MEMBER_PASSWORD;
module.exports.MEMBER_PASSWORD = MEMBER_PASSWORD;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
module.exports.ADMIN_PASSWORD = ADMIN_PASSWORD;

const User = require("./models/user");

const indexRouter = require("./routes/index");

const app = express();

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});
app.use(limiter);

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(MONGODBURL);
}

const sessionStore = new MongoStore({
  client: mongoose.connection.getClient(),
  collectionName: "sessions",
});

app.use(
  session({
    secret: "cats",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 24 * 60 * 60 * 1000 /* a day */ },
  })
);

app.use(passport.initialize());
app.use(passport.authenticate("session"));

passport.use(
  new LocalStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      req.session.messages = [];
      try {
        const user = await User.findOne({ username: username });
        if (user) {
          const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
          );
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
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, { _id: user._id, admin: user.admin, member: user.member });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(helmet());
app.use(compression());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

// add user variable to view files
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

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
