import express from "express";
import { Router } from "express";
import Note from "../models/Note.js";
import { body, validationResult } from "express-validator";
import fetchuser from "../middleware/fetchuser.js";

const router = express.Router();

//Route 1: create a note
router.post(
  "/createnote",
  [
    //Validation Checks
    body("title", "Title cannot be empty").notEmpty().isLength({ min: 3 }),
    body("description", "description cannot be empty")
      .notEmpty()
      .isLength({ min: 5 }),
  ],
  fetchuser,
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        //Creating a new Note
        const note = await Note.create({
          user: req.userId,
          title: req.body.title,
          description: req.body.description,
          tag: req.body.tag,
        });
        res.json(note);
      } else {
        res.send({ errors: result.array() });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route 2: fetch all the notes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
