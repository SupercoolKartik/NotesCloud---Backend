import express from "express";
import { Router } from "express";
import Note from "../models/Note.js";
import { body, validationResult } from "express-validator";
import fetchuser from "../middleware/fetchuser.js";

const router = express.Router();

// ROUTE 1: Create a note (Login Required)
router.post(
  "/createnote",
  [
    // Validation Checks
    body("title", "Title should be of minimum 3 characters long").isLength({
      min: 3,
    }),
    body(
      "description",
      "Description should be of minimum 5 characters long"
    ).isLength({ min: 5 }),
  ],
  fetchuser,
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        // Creating a new Note
        const tag = req.body.tag === "" ? "General" : req.body.tag;
        const note = await Note.create({
          user: req.userId,
          title: req.body.title,
          description: req.body.description,
          tag: tag,
        });
        res.json(note);
      } else {
        // 400 Bad Request
        res.status(400).json({ errors: result.array() });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 2: Fetch all the notes (Login Required)
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ROUTE 3: Update a note (Login Required)
router.put(
  "/updatenote/:id",
  [
    // Validation Checks
    body("title", "Title should be of minimum 3 characters long").isLength({
      min: 3,
    }),
    body(
      "description",
      "Description should be of minimum 5 characters long"
    ).isLength({
      min: 5,
    }),
  ],
  fetchuser,
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        // Creating a new Note
        const { title, description, tag } = req.body;
        const newNote = {};
        if (title) {
          newNote.title = title;
        }
        if (description) {
          newNote.description = description;
        }
        if (tag) {
          newNote.tag = tag;
        }

        // Check if the Note with the provided id exists
        let note = await Note.findById(req.params.id);
        if (!note) {
          return res.status(404).json({ msg: "No note with that ID" });
        }

        // Make sure the logged-in User is the one who created the Note
        if (req.userId !== note.user.toString()) {
          return res.status(401).json({ msg: "User not authorized" });
        }

        // Find the note to be Updated and Update it
        note = await Note.findByIdAndUpdate(
          req.params.id,
          { $set: newNote },
          { new: true }
        );
        res.json(note);
      } else {
        // 400 Bad Request for validation errors
        res.status(400).json({ errors: result.array() });
      }
    } catch (error) {
      // Handle other errors
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 4: Delete a note (Login Required)
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Check if the Note with the provided id exists
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ msg: "No note with that ID" });
    }

    // Make sure the logged-in User is the one who created the Note
    if (req.userId !== note.user.toString()) {
      return res
        .status(401)
        .json({ msg: "Please authenticate using a valid token" });
    }

    // Find the note to be Deleted and Delete it
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "The note has been deleted", note: note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
