var express = require("express");
var router = express.Router();

const placeholderController = (req, res) => {
  res.send("to be implemented");
};

router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/login", placeholderController);

router.post("/login", placeholderController);

router.get("/sign-up", placeholderController);

router.post("/sign-up", placeholderController);

router.get("/logout", placeholderController);

router.post("/logout", placeholderController);

router.get("/member", placeholderController);

router.post("/member", placeholderController);

router.get("/admin", placeholderController);

router.post("/admin", placeholderController);

router.get("/new-message", placeholderController);

router.post("/new-message", placeholderController);

module.exports = router;
