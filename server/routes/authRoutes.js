const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");

const sendVerificationEmail = require("../utils/sendEmail");

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


    // ---------------------------------------------
    // Check required fields
    // ---------------------------------------------
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


    // ---------------------------------------------
    // Check password confirmation
    // ---------------------------------------------
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }


    // ---------------------------------------------
    // Check password length
    // ---------------------------------------------
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }


    // ---------------------------------------------
    // Normalize email
    // ---------------------------------------------
    const normalizedEmail = email.toLowerCase().trim();


    // ---------------------------------------------
    // Check if user already exists
    // ---------------------------------------------
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }


    // ---------------------------------------------
    // Hash password
    // ---------------------------------------------
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );


    // ---------------------------------------------
    // Generate secure verification token
    // ---------------------------------------------
    const verificationToken =
      crypto.randomBytes(32).toString("hex");


    // ---------------------------------------------
    // Verification token expires after 24 hours
    // ---------------------------------------------
    const verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );


    // ---------------------------------------------
    // Create user
    // ---------------------------------------------
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth,
      email: normalizedEmail,
      password: hashedPassword,

      isEmailVerified: false,

      verificationToken,
      verificationTokenExpires,
    });


    // ---------------------------------------------
    // Send verification email
    // ---------------------------------------------
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken
      );
    } catch (emailError) {
      console.error(
        "Verification email error:",
        emailError
      );

      // Delete account if email could not be sent
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message:
          "Account could not be created because the verification email could not be sent.",
      });
    }


    // ---------------------------------------------
    // Registration successful
    // ---------------------------------------------
    res.status(201).json({
      message:
        "Account created successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message: "Server error during registration",
    });
  }
});


// =====================================================
// VERIFY EMAIL
// =====================================================
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;


    // ---------------------------------------------
    // Check token
    // ---------------------------------------------
    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }


    // ---------------------------------------------
    // Find user using verification token
    // ---------------------------------------------
    const user = await User.findOne({
      verificationToken: token,
    });


    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired verification link",
      });
    }


    // ---------------------------------------------
    // Check token expiration
    // ---------------------------------------------
    if (
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "Verification link has expired. Please request a new verification email.",
      });
    }


    // ---------------------------------------------
    // Verify email
    // ---------------------------------------------
    user.isEmailVerified = true;

    // Remove verification token after successful verification
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();


    // ---------------------------------------------
    // Verification successful
    // ---------------------------------------------
    res.json({
      message:
        "Email verified successfully. You can now log in.",
    });

  } catch (error) {
    console.error(
      "Email verification error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during email verification",
    });
  }
});


// =====================================================
// LOGIN
// =====================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


    // ---------------------------------------------
    // Check required fields
    // ---------------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please provide email and password",
      });
    }


    // ---------------------------------------------
    // Normalize email
    // ---------------------------------------------
    const normalizedEmail = email.toLowerCase().trim();


    // ---------------------------------------------
    // Find user
    // ---------------------------------------------
    const user = await User.findOne({
      email: normalizedEmail,
    });


    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }


    // ---------------------------------------------
    // Check password
    // ---------------------------------------------
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }


    // ---------------------------------------------
    // Check email verification
    // ---------------------------------------------
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in.",
      });
    }


    // ---------------------------------------------
    // Create JWT
    // ---------------------------------------------
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    // ---------------------------------------------
    // Send login response
    // ---------------------------------------------
    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,

        // Keep name for compatibility
        // with existing dashboard code
        name: `${user.firstName} ${user.lastName}`,

        gender: user.gender,
        dateOfBirth: user.dateOfBirth,

        email: user.email,

        isEmailVerified:
          user.isEmailVerified,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during login",
    });
  }
});


module.exports = router;
