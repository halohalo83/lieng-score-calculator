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

// Check auth route
app.get("/api/check-auth", async (req, res) => {
  try {
    const auth = await authorize();
    res.json({ success: auth.credentials !== null });
  } catch (error) {
    console.error("Error checking auth:", error);
    res.status(500).json({ success: false });
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

// Delete sheet route
app.delete("/api/delete-sheet/:sheetId", async (req, res) => {
  const { sheetId } = req.params;
  try {
    const auth = await authorize();
    await deleteSheet(auth, spreadsheetId, Number(sheetId));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting sheet:", error);
    res.status(500).json({ success: false, error: "Failed to delete sheet" });
  }
});

// Check sheet have data
app.get("/api/check-data/:sheetId", async (req, res) => {
  const { sheetId } = req.params;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });
    console.log(sheets, 'sheetData');

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetId}!A1:A1`,
    });

    res.json({ success: true, hasData: sheetData.data.values.length > 0 });
  } catch (error) {
    console.error("Error checking sheet:", error);
    res.status(500).json({ success: false, error: "Failed to check sheet" });
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

async function deleteSheet(auth, spreadsheetId, sheetId) {
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          deleteSheet: {
            sheetId,
          },
        },
      ],
    },
  });
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
