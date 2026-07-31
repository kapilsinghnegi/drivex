const express = require("express");
const userModel = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
router.get("/register", (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.error("Render register error:", error);
    res.status(500).send("Internal server error");
  }
});

router.post(
  "/register",
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .isLength({ min: 13 })
    .withMessage("Email address is too short."),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long."),
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("register", {
          error: errors.array()[0].msg,
          username,
          email,
        });
      }

      // Check if username already exists
      const existingUsername = await userModel.findOne({ username });
      if (existingUsername) {
        return res.status(409).render("register", {
          error: "Username already exists.",
          username,
          email,
        });
      }

      // Check if email already exists
      const existingEmail = await userModel.findOne({ email });
      if (existingEmail) {
        return res.status(409).render("register", {
          error: "An account with this email already exists.",
          username,
          email,
        });
      }

      // Hash password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create user
      await userModel.create({ username, email, password: hashPassword });

      // Registration successful
      res.redirect("/user/login");
    } catch (err) {
      console.error("Registration error:", err);

      res.status(500).render("register", {
        error: "Something went wrong. Please try again.",
        username: req.body.username,
        email: req.body.email,
      });
    }
  },
);

// ==================== LOGIN ====================

router.get("/login", (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.error("Render login error:", error);
    res.status(500).send("Internal server error");
  }
});

router.post(
  "/login",
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long."),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),
  async (req, res) => {
    try {
      const { username, password } = req.body;
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("login", {
          error: errors.array()[0].msg,
          username,
        });
      }
      // Find user
      const user = await userModel.findOne({ username });
      if (!user) {
        return res.status(400).render("login", {
          error: "Username or password is incorrect.",
          username,
        });
      }
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).render("login", {
          error: "Username or password is incorrect.",
          username,
        });
      }
      // Create JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET,
      );
      res.cookie("token", token);

      // Successful login
      res.redirect("/home");
    } catch (err) {
      console.error("Login error:", err);

      res.status(500).render("login", {
        error: "Something went wrong. Please try again.",
        username: req.body.username,
      });
    }
  },
);

// ==================== LOGOUT ====================

router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    res.redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
