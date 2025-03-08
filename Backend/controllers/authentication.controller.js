// Import necessary modules
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";

// Helper method to generate access and refresh tokens
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Something went wrong while generating tokens");
  }
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    // Get user details from request
    const { username, email, fullName, password } = req.body;

    // Validation - check if all required fields are provided
    if ([username, email, fullName, password].some((field) => !field || field.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with email or username already exists"
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      fullName,
      password : hashedPassword
    });

    // Check if user was created successfully and exclude password and refresh token
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while registering the user"
      });
    }

    // Return response
    return res.status(201).json({
      success: true,
      data: createdUser,
      message: "User registered successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    // Get credentials from request
    const { email, username, password } = req.body;

    // Check if email or username is provided
    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: "Email or username is required"
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }


 



    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password provided:", password);
    console.log("Password stored:", user.password);
    console.log("Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user._id);

    // Get user details without password and refresh token
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Set cookies with tokens
    const options = {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    };

    // Return response with cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        data: {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        message: "User logged in successfully"
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    // Find user by ID and clear refresh token











    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: null,
        },
      },
      {
        new: true,
      }
    );

    // Clear cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Return response
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "User logged out successfully"
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
  try {
    // Get refresh token from cookies or request body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required"
      });
    }

    // Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user by ID
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    // Check if refresh token matches
    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is expired or used"
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateTokens(user._id);

    // Set cookies with new tokens
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Return response with cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        data: { accessToken, refreshToken },
        message: "Access token refreshed successfully"
      });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error?.message || "Invalid refresh token"
    });
  }
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };