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

//ROUTE 1: Create a User using POST api/auth/createuser, (No login required)
router.post(
  "/createuser",
  [
    //Validation Checks
    body("username", "Username must be atleast 3 characters long!").isLength({
      min: 3,
    }),
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Password is required!").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    ////If there are no errors
    if (result.isEmpty()) {
      //Logic to find out if a user with same email already exists
      let user = await User.findOne({ email: req.body.email }).exec();
      if (user) {
        //400 Bad Request
        return res.status(400).send("Email is not unique!");
      }

      // Hashing the password
      const saltRounds = 10;
      const hashedPass = await bcrypt.hash(req.body.password, saltRounds);

      //Creating a new user
      user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
      });

      //Sending the Authorisation Token to the user
      const tokenData = {
        user: {
          name: user.username,
          id: user.id,
        },
      };
      const authToken = jwt.sign(tokenData, secSign);
      res.json({ authToken });
    }

    ////If there are Validtion errors
    else {
      // 400 Bad Request
      res.status(400).send({ errors: result.array() });
    }
  }
);

//ROUTE 2: User Authentication using POST api/auth/login, (No login required)
router.post(
  "/login",
  [
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Password must be at least 10 characters long!").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      let user = await User.findOne({ email: req.body.email }).exec();
      if (!user) {
        //404 User Not Found
        return res.status(404).send("User not found.");
      }

      // Comparing the passwords
      const compareResult = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!compareResult) {
        return res.status(401).send("Passwords don't match!");
      } else {
        return res.send("User verified successfully!");
      }
    } else {
      //400 Bad Request
      return res.status(400).send({ errors: result.array() });
    }
  }
);

//ROUTE 3: Fetch Logged in user's data, (Loging required)
router.post("/getuserdata", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
