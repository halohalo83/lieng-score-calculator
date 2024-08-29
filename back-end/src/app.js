const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const {
  authorize,
  getOAuth2Client,
  getAndSaveToken,
} = require("./config/authorize");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const { spreadsheetId } = require("./config/config");
const SheetModel = require("./models/sheet-model");

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const moment = require("moment");

// OAuth2 callback route
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const oAuth2Client = await getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    await getAndSaveToken(tokens);
    res.send("Authentication successful! You can close this tab.");
  } catch (error) {
    console.error("Error retrieving access token", error);
    res.status(500).send("Error retrieving access token");
  }
});

// Start game route
app.post("/api/start-game", async (req, res) => {
  try {
    const auth = await authorize();
    const today = moment().format("DD/MM/YYYY");
    const sheetName = await createSheet(auth, spreadsheetId, today);

    res.json({ success: true, sheetName });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ success: false, error: "Failed to start game" });
  }
});

// Get all sheets route
app.get("/api/get-all-sheets", async (req, res) => {
  try {
    const auth = await authorize();

    const result = await getAllSheets(auth, spreadsheetId);

    res.json({ success: true, result });
  } catch (error) {
    console.error("Error getting all sheets:", error);
    res.status(500).json({ success: false, error: "Failed to get all sheets" });
  }
});

// Auto generate sheet
app.post("/api/create-sheet", async (req, res) => {
  try {
    const auth = await authorize();
    const today = moment().format("DD/MM/YYYY");
    const sheetName = await createSheet(auth, spreadsheetId, today);

    res.json({ success: true, sheetName });
  } catch (error) {
    console.error("Error creating sheet:", error);
    res.status(500).json({ success: false, error: "Failed to create sheet" });
  }
});

async function createSheet(auth, spreadsheetId, today) {
  const sheets = google.sheets({ version: "v4", auth });

  const sheetsList = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = sheetsList.data.sheets.map(
    (sheet) => sheet.properties.title
  );

  let sheetName = today;
  let suffix = 0;

  while (existingSheets.includes(sheetName)) {
    suffix += 1;
    sheetName = `${today} (${suffix})`;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          addSheet: {
            properties: { title: sheetName },
          },
        },
      ],
    },
  });

  return sheetName;
}

async function getAllSheets(auth, spreadsheetId) {
  const sheets = google.sheets({ version: "v4", auth });

  const sheetsList = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = sheetsList.data.sheets
    .filter((sheet) => sheet.properties.sheetId !== 0)
    .map(
      (sheet) =>
        new SheetModel(
          sheet.properties.sheetId,
          sheet.properties.title,
          sheet.properties.index
        )
    );

  return existingSheets;
}
