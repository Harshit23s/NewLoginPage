const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const keys = require("./secret.json");
// require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://noni2323:noni9414@registrationapp.xwelvel.mongodb.net/?retryWrites=true&w=majority&appName=RegistrationApp",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SHEET_ID = "1ZIf8zuYzJci6VRjCVE-poyVabLyCkR7lZ_Su0O7MZ3A"; // 📝 Replace this with your actual Sheet ID

// Save user to sheet
// app.post("/", async (req, res) => {
//   try {
//     const client = await auth.getClient();
//     const sheets = google.sheets({ version: "v4", auth: client });

//     const { name, email } = req.body;

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SHEET_ID,
//       range: "Sheet1!A:B",
//       valueInputOption: "RAW",
//       requestBody: {
//         values: [[name, email]],
//       },
//     });

//     res.status(200).json({ message: "Data saved" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error saving data");
//   }
// });
const User = require("./models/User"); // 👈 Add this

app.post("/", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { name, email } = req.body;

    // 👉 Save to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:B",
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, email]],
      },
    });

    // 👉 Save to MongoDB
    const newUser = new User({ name, email });
    await newUser.save();

    res.status(200).json({ message: "Saved to Google Sheets and MongoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});

// Validate login
app.post("/login", async (req, res) => {
  try {
    const { name, email } = req.body;

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:B",
    });

    const rows = result.data.values || [];

    const found = rows.some((row) => row[0] === name && row[1] === email);

    if (found) {
      res.status(200).json({ message: "Login success" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error validating login");
  }
});

// we get the data from the sheet
app.get("/data", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:B", // Adjust if you use different columns
    });

    res.status(200).json(result.data.values || []);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

// We are deleting the the data we get row by row
app.delete("/delete/:rowIndex", async (req, res) => {
  const rowIndex = parseInt(req.params.rowIndex); // 0-based index from frontend

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      auth: client,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Usually 0 if it's the first sheet
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    res.status(200).json({ message: "Row deleted" });
  } catch (err) {
    console.error("Error deleting row:", err);
    res.status(500).send("Error deleting row");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:8000`);
});
