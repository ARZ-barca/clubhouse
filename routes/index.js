const express = require("express");
const router = express.Router();

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
  body("firstname", "firstname should be between 3 and 50 characters")
    .trim()
    .isEmpty()
    .withMessage("firstname can't be empty")
    .isLength({ min: 3, max: 50 }),
  body("lastname", "lastname should be between 3 and 50 characters")
    .trim()
    .isLength({ min: 3, max: 50 }),
  body("username", "username should be between 3 and 50 characters")
    .trim()
    .isEmpty()
    .withMessage("username can't be empty"),
  (req, res, next) => {},
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
