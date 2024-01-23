import express from "express";
import { Router } from "express";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

//Create a User using POST api/auth/createuser (No login required)
router.post(
  "/createuser",
  [
    //Validation Checks
    body("username", "The Message is clear, Thala for a reason! 7").notEmpty(),
    body("email", "Not an Email!").isEmail(),
  ],
  async (req, res) => {
    console.log(req.body.email);
    const result = validationResult(req);

    //If there are no errors
    if (result.isEmpty()) {
      //Logic to find out if a user with same email already exists
      let user = await User.findOne({ email: req.body.email }).exec();
      if (user) {
        console.log("The user with existing email", user);
        return res.send("Email is not unique!");
      }

      user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
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
