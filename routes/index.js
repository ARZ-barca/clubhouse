const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const Message = require("../models/message");

const { validationResult, body } = require("express-validator");
const passport = require("passport");

const placeholderController = (req, res) => {
  res.send("to be implemented");
};

const MEMBER_PASSWORD = require("../app").MEMBER_PASSWORD;
const ADMIN_PASSWORD = require("../app").ADMIN_PASSWORD;

// a utility function
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    let messages;
    if (req.isAuthenticated() && req.user.member) {
      messages = await Message.find({})
        .populate("author")
        .sort({ createdAt: 1 });
    } else {
      messages = await Message.find({}, { author: 0 }).sort({ createdAt: -1 });
    }

    res.render("index", { messages });
  })
);

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
      res.render("signup", { info: user, errors: errors.array() });
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

router.get("/login", (req, res, next) => {
  if (req.session.messages) {
    res.render("login", {
      errors: [{ msg: req.session.messages[req.session.messages.length - 1] }],
    });
  } else {
    res.render("login");
  }
});

router.post("/login", [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username can't be empty")
    .isLength({ max: 50 })
    .withMessage("username should be below 50 characters")
    .escape(),
  body("password", "password should be atleast 6 characters")
    .trim()
    .notEmpty()
    .withMessage("password can't be empty")
    .isLength({ min: 6 })
    .escape(),
  (req, res, next) => {
    // express validator errors catcher
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("login", {
        info: { username: req.body.username },
        errors: errors.array(),
      });
      return;
    } else {
      next();
    }
  },
  passport.authenticate("local", {
    failureMessage: true,
    failureRedirect: "/login",
    successRedirect: "/",
  }),
]);

router.post("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.use("/member", isAuth);

router.get("/member", (req, res, next) => {
  res.render("member");
});

router.post("/member", [
  body("member-pass")
    .custom((value) => {
      return value === MEMBER_PASSWORD;
    })
    .withMessage("wrong password try inspecting")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("member", { errors: errors.array() });
      return;
    }
    const user = await User.findById(req.user._id);
    user.member = true;
    await user.save();
    req.session.passport.user.member = true;
    res.redirect("/");
  }),
]);

router.use("/admin", isAuth, (req, res, next) => {
  if (req.user.member) {
    return next();
  } else {
    res.redirect("/member");
  }
});

// tod (same as member)

router.get("/admin", (req, res, next) => {
  res.render("admin");
});

router.post("/admin", [
  body("admin-pass")
    .custom((value) => {
      return value === ADMIN_PASSWORD;
    })
    .withMessage("wrong password, did you check out my website?")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("admin", { errors: errors.array() });
      return;
    }
    const user = await User.findById(req.user._id);
    user.admin = true;
    await user.save();
    req.session.passport.user.admin = true;
    res.redirect("/");
  }),
]);

router.use("/new-message", isAuth);

router.get("/new-message", (req, res, next) => {
  res.render("new-message");
});

router.post("/new-message", [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title can't be empty")
    .isLength({ max: 100 })
    .withMessage("title can't be more than 100 characters")
    .escape(),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("content can't be empty")
    .isLength({ max: 1000 })
    .withMessage("content can't be more than 1000 characters")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const message = new Message({
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
    });

    if (!errors.isEmpty()) {
      res.render("new-message", { info: message, errors: errors.array() });
      return;
    } else {
      await message.save();
      res.redirect("/");
    }
  }),
]);

router.post(
  "/delete-message/:id",
  asyncHandler(async (req, res, next) => {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect("/");
  })
);

module.exports = router;
