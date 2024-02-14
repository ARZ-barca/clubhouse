const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const { validationResult, body } = require("express-validator");

const placeholderController = (req, res) => {
  res.send("to be implemented");
};

router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", [
  body("firstname", "firstname should be below 50 characters")
    .trim()
    .notEmpty()
    .withMessage("firstname can't be empty")
    .isLength({ max: 50 })
    .escape(),
  body("lastname", "lastname should be below 50 characters")
    .trim()
    .optional({ values: "falsy" })
    .isLength({ max: 50 })
    .escape(),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username can't be empty")
    .isLength({ max: 50 })
    .withMessage("username should be below 50 characters")
    .custom(async (value) => {
      const userWithTHisUsername = await User.findOne({ username: value });
      if (userWithTHisUsername) {
        throw new Error("user with this username already exists");
      }
      return true;
    })
    .escape(),
  body("password", "password should be atleast 6 characters")
    .trim()
    .notEmpty()
    .withMessage("password can't be empty")
    .isLength({ min: 6 })
    .escape(),
  body("passwordConfirm", "password confirm doesn't match the password")
    .custom((value, { req }) => {
      return req.body.password === value;
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      passwordHash: "placeholder",
    });

    if (!errors.isEmpty()) {
      console.log(errors.array());
      res.render("signup", { user: user, errors: errors.array() });
      return;
    }

    bcrypt.hash(req.body.password, 10, async (err, passwordHash) => {
      if (err) {
        next(err);
      }
      user.passwordHash = passwordHash;
      await user.save();
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    });
  }),
]);

router.get("/login", placeholderController);

router.post("/login", placeholderController);

router.get("/logout", placeholderController);

router.post("/logout", placeholderController);

router.get("/member", placeholderController);

router.post("/member", placeholderController);

router.get("/admin", placeholderController);

router.post("/admin", placeholderController);

router.get("/new-message", placeholderController);

router.post("/new-message", placeholderController);

module.exports = router;
