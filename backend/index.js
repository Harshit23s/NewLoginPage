const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
require("dotenv").config(); // Load the environment variables
const mongoose = require("mongoose");

const app = express();

// Use the environment variables
const PORT = 8000;
const MONGO_URI = process.env.MONGO_URI;
const SHEET_ID = process.env.SHEET_ID;

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const auth = new google.auth.GoogleAuth({
  credentials: require("./secret.json"), // Keep your credentials in a separate file
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Save user to sheet and MongoDB
app.post("/", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { name, email } = req.body;

    // Save to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:B",
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, email]],
      },
    });

    // Save to MongoDB
    const newUser = new User({ name, email });
    await newUser.save();

    res.status(200).json({ message: "Saved to Google Sheets and MongoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});

// Other routes...

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
