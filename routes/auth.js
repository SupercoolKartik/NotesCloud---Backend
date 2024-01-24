import express from "express";
import { Router } from "express";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

const router = express.Router();

//Create a User using POST api/auth/createuser (No login required)
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
      let user = await User.findOne({ email: req.body.email }).exec();
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

      res.json(user);
    }

    //If there are errors
    else {
      res.send({ errors: result.array() });
    }
  }
);

export default router;
