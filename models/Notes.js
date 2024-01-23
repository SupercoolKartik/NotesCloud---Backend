import mongoose, { Schema } from "mongoose";

const notesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: "General",
  },
  date: {
    type: date,
    default: Date.now,
  },
});

const Notes = mongoose.model("notes", notesSchema);
export default Notes;
