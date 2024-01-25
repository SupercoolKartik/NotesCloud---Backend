import express from "express";
import connectToMongo from "./db.js";

connectToMongo();

const app = express();
const PORT = 5000;

app.use(express.json()); // Parse incoming requests data as JSON

app.get("/", (req, res) => {
  res.send("Welcome to the NotesCloud server");
});

import authRouter from "./routes/auth.js";
app.use("/api/auth", authRouter);

import notesRouter from "./routes/notes.js";
app.use("/api/notes", notesRouter);

//App Listner
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
