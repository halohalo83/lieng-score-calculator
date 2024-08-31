const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const {
  authorize,
  getOAuth2Client,
  getAndSaveToken,
  visitUrlToAuthorize
} = require("./config/authorize");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const { spreadsheetId, rankingSheetId } = require("./config/config");
const SheetModel = require("./models/sheet-model");
const PlayerScoreModel = require("./models/player-score-model");

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const moment = require("moment");
const PlayerRankingModel = require("./models/player-ranking-model");

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
    var isExpired = auth.isTokenExpiring();
    res.json({ success: auth?.credentials?.access_token !== undefined && !isExpired });
  } catch (error) {
    console.error("Error checking auth:", error);
    res.status(500).json({ success: false });
  }
});

// Get auth url route
app.get("/api/get-auth-url", async (req, res) => {
  try {
    const authUrl = await visitUrlToAuthorize();
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error("Error getting auth url:", error);
    res.status(500).json({ success: false, error: "Failed to get auth url" });
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

// Get all players route
app.get("/api/get-all-players", async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `BXH!A2:C`,
    });

    const players = sheetData.data.values.map(
      ([id, name, score]) => new PlayerScoreModel(id, name, score)
    );

    res.json({ success: true, players });
  } catch (error) {
    console.error("Error getting all players:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get all players" });
  }
});

// Get all rankings route
app.get("/api/get-rankings", async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `BXH!G2:J`,
    });

    const rankings = sheetData.data.values.map(
      ([rank, id, name, score]) => new PlayerRankingModel(rank, id, name, score)
    );

    res.json({ success: true, rankings });
  } catch (error) {
    console.error("Error getting rankings:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get rankings" });
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

// Function get sheet name by id route
async function getSheetNameById(auth, sheetId) {
  const sheets = google.sheets({ version: "v4", auth });

  const sheetData = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = sheetData.data.sheets.find(
    (sheet) => sheet.properties.sheetId === Number(sheetId)
  );

  return sheet.properties.title;
}

// Update sheet route
app.post("/api/update-sheet", async (req, res) => {
  const { sheetId, players } = req.body;
  
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const names = players.map((player) => player.name);

    const range = `${await getSheetNameById(auth, sheetId)}!A1`;

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    if (sheetData.data.values) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });
    }

    const response = sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [names],
      },
    });

    res.json({ success: true, response });
  } catch (error) {
    console.error("Error updating sheet:", error);
    res.status(500).json({ success: false, error: "Failed to update sheet" });
  }
});


// save score to sheet route
app.post("/api/save-score", async (req, res) => {
  // req.body will have sheetId, list of playerModel
  const { sheetId, players } = req.body;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    // Save score to rankings sheet
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `BXH!A2:C`,
    });

    const playerScores = sheetData.data.values.map(
      ([id, name, score]) => new PlayerScoreModel(id, name, score)
    );

    const playerScoresMap = playerScores.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {});

    const rankingValues = players.map((player) => {
      const playerScore = playerScoresMap[player.id];
      if (playerScore) {
        playerScore.score = player.score;
      }
      return [player.id, player.name, player.score];
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `BXH!A2:C`,
      valueInputOption: "USER_ENTERED",
      resource: {
        rankingValues,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ success: false, error: "Failed to save score" });
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
    .filter(
      (sheet) =>
        sheet.properties.sheetId !== 0 &&
        sheet.properties.sheetId !== rankingSheetId
    )
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
