import express, { application } from "express";
import { Router } from "express";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fetchuser from "../middleware/fetchuser.js";

const secSign = process.env.SECRET_SIGN;

import bcrypt from "bcrypt";

const router = express.Router();

//Route 1: Create a User using POST api/auth/createuser, (No login required)
router.post(
  "/createuser",
  [
    //Validation Checks
    body("username", "Username cannot be empty").notEmpty(),
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Password is required").notEmpty(),
  ],
  async (req, res) => {
    console.log(req.body.email);
    console.log(req.body.password);

    const result = validationResult(req);
    console.log("Original password", req.body.password);

    //If there are no errors
    if (result.isEmpty()) {
      //Logic to find out if a user with same email already exists
      const user = await User.findOne({ email: req.body.email }).exec();
      if (user) {
        console.log("The user with existing email", user);
        return res.send("Email is not unique!");
      }

      // Hashing the password
      const saltRounds = 10;
      const hashedPass = await bcrypt.hash(req.body.password, saltRounds);

      user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
      });

      const tokenData = {
        user: {
          name: user.username,
          id: user.id,
        },
      };
      const authToken = jwt.sign(tokenData, secSign);
      console.log("Token is ", authToken);
      res.json({ authToken });
    }

    //If there are errors
    else {
      res.send({ errors: result.array() });
    }
  }
);

//Route 2: User Authentication using POST api/auth/login, (No login required)
router.post(
  "/login",
  [
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Password is required").notEmpty(),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send("Please enter valid credentials!");
    }
    let user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
      return res.status(401).send("User not found.");
    }

    const compareResult = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!compareResult) {
      return res.status(401).send("Passwords don't match!");
    } else {
      return res.send("User verified successfully!");
    }
  }
);

//Route 3: Fetch Logged in user's data, (Loging required)
router.post("/getuserdata", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).send("User not found");
    }
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
