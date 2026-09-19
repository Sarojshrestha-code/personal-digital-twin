 const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// =====================================================
// REGISTER
// =====================================================
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      password,
      confirmPassword,
    } = req.body;

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !gender ||
      !dateOfBirth ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth,
      email: normalizedEmail,
      password: hashedPassword,

      // Email verification is disabled
      isEmailVerified: true,
    });

    // Registration successful
    res.status(201).json({
      message: "Account created successfully",

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
});


// =====================================================
// LOGIN
// =====================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // =================================================
    // EMAIL VERIFICATION CHECK REMOVED
    // =================================================

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Login response
    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,

        // Keep name for existing dashboard
        name: `${user.firstName} ${user.lastName}`,

        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        email: user.email,

        // Verification is no longer required
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
});


module.exports = router;