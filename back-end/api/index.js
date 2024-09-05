const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { google } = require("googleapis");
const {
  authorize,
  getOAuth2Client,
  getAndSaveToken,
  visitUrlToAuthorize,
  logOut,
} = require("../src/config/authorize");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const { spreadsheetId, rankingSheetId } = require("../src/config/config");
const SheetModel = require("../src/models/sheet-model");
const PlayerScoreModel = require("../src/models/player-score-model");
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = app;

const moment = require("moment");
const PlayerRankingModel = require("../src/models/player-ranking-model");

// OAuth2 callback route
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const oAuth2Client = await getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);

    await getAndSaveToken(oAuth2Client, tokens);

    console.log(process.env.HOME_URI, "home uri");
    
    res.redirect(process.env.HOME_URI);

  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// Check auth route
app.get("/api/check-auth", async (req, res) => {
  try {
    const auth = await authorize();
    var isExpired = auth.isTokenExpiring();
    res.json({
      success: auth?.credentials?.access_token !== undefined && !isExpired,
    });
  } catch (error) {
    
    res.status(error.status).send(`${error.message}`);
  }
});

// Logout route
app.get("/api/log-out", async (req, res) => {
  try {
    await logOut();
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// Get auth url route
app.get("/api/get-auth-url", async (req, res) => {
  try {
    const authUrl = await visitUrlToAuthorize();
    res.json({ success: true, authUrl });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// Get all sheets route
app.get("/api/get-all-sheets", async (req, res) => {
  try {
    const auth = await authorize();

    const result = await getAllSheets(auth, spreadsheetId);

    res.json({ success: true, result });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// Get all players route
app.get("/api/get-all-players", async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, rankingSheetId)}!A2:C`,
    });

    const players = sheetData.data.values.map(
      ([id, name, score]) => new PlayerScoreModel(id, name, score)
    );

    res.json({ success: true, players });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// Get all rankings route
app.get("/api/get-rankings", async (req, res) => {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, rankingSheetId)}!G2:J`,
    });

    const rankings = sheetData.data.values.map(
      ([rank, id, name, score]) => new PlayerRankingModel(rank, id, name, score)
    );

    res.json({ success: true, rankings });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// Auto generate sheet
app.post("/api/create-sheet", async (req, res) => {
  try {
    const auth = await authorize();
    const sheetName = await createSheet(auth, spreadsheetId);

    res.json({ success: true, sheetName });
  } catch (error) {
    console.log(error, "errror");
    res.status(error.status).send(`${error.message}`);
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
    res.status(error.status).send(`${error.message}`);
  }
});

// pre-config selected sheet route
app.post("/api/config-selected-sheet", async (req, res) => {
  const { sheetId, players } = req.body;

  try {
    const auth = await authorize();
    await configSelectedSheet(auth, sheetId, players);

    res.json({ success: true });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
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
      range: `${await getSheetNameById(auth, rankingSheetId)}!A2:C`,
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
    res.status(error.status).send(`${error.message}`);
  }
});

// fill score round to sheet route
app.post("/api/fill-round-scores", async (req, res) => {
  const { sheetId, players, initialScore } = req.body;

  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    // find the last row of the sheet
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A1:Z`,
    });

    const insertRowIndex = sheetData.data.values.length;

    const range = {
      startRowIndex: insertRowIndex,
      endRowIndex: insertRowIndex + 1,
      startColumnIndex: 0,
      endColumnIndex: players.length,
    };

    await applyConditionalFormatting(auth, sheetId, initialScore, range);

    const values = players.map((player) => player.score);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A${insertRowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [values],
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// delete the last round route
app.delete("/api/delete-last-round/:sheetId", async (req, res) => {
  const { sheetId } = req.params;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A1:Z`,
    });

    const lastRowIndex = sheetData.data.values.length;

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A${lastRowIndex}:Z`,
    });

    // clear all row A3

    res.json({ success: true });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// get round scores route
app.get("/api/get-round-scores/:sheetId", async (req, res) => {
  const { sheetId } = req.params;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A2:Z`,
    });

    const scores = sheetData.data.values[0].map((score) => Number(score));

    res.json({ success: true, scores });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// save score to rankings route
app.post("/api/save-scores-to-rankings", async (req, res) => {
  const { players } = req.body;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    // Get existing scores from the rankings sheet
    const range = `${await getSheetNameById(auth, rankingSheetId)}!A2:C`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const existingScores = response.data.values || [];

    // convert to array of PlayerScoreModel
    const existingPlayerScores = existingScores.map(
      ([id, name, score]) => new PlayerScoreModel(id, name, parseInt(score))
    );

    // Map to existing score and add up the new score
    const playerScoresMap = existingPlayerScores.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {});

    players.forEach((player) => {
      const playerScore = playerScoresMap[player.id];
      if (playerScore) {
        playerScore.score += player.score;
      } else {
        playerScoresMap[player.id] = new PlayerScoreModel(
          player.id,
          player.name,
          player.score
        );
      }
    });

    // save to rankings sheet
    const rankingValues = Object.values(playerScoresMap).map((player) => [
      player.id,
      player.name,
      player.score,
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: rankingValues,
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// get the last 5 rounds by sheetId route
app.get("/api/get-last-5-rounds/:sheetId", async (req, res) => {
  const { sheetId } = req.params;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A3:Z`,
    });

    const rounds = sheetData.data.values.slice(-5);

    res.json({ success: true, rounds });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// get the last round by sheetId route
app.get("/api/get-last-round/:sheetId", async (req, res) => {
  const { sheetId } = req.params;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A1:Z`,
    });

    const lastRowIndex = sheetData.data.values.length;

    const round = sheetData.data.values[lastRowIndex - 1];

    res.json({ success: true, round });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// replace the last 5 rounds by sheetId route
app.post("/api/replace-last-5-rounds", async (req, res) => {
  const { sheetId, rounds } = req.body;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const range = `${await getSheetNameById(auth, sheetId)}!A1:Z`;

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const lastRowIndex = sheetData.data.values.length;

    if (rounds.length > lastRowIndex - 2) {
      res
        .status(400)
        .json({
          success: false,
          error:
            "Number of rounds is greater than the number of rounds in the sheet",
        });
      return;
    }

    const startRowNeedClear = lastRowIndex - rounds.length + 1;

    const sumOfRounds = rounds.reduce((acc, round) => {
      return acc + round.reduce((acc, score) => acc + Number(score), 0);
    }, 0);

    if (sumOfRounds !== 0) {
      res
        .status(400)
        .json({ success: false, error: "Gà đéo khớp, kiểm tra lại" });
      return;
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A${startRowNeedClear}:Z`,
    });

    // Fill the rounds
    for (let i = 0; i < rounds.length; i++) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${await getSheetNameById(auth, sheetId)}!A${
          startRowNeedClear + i
        }:Z`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rounds[i]],
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

// get result of sheet in a sheet route
app.get("/api/get-result-of-sheet/:sheetId", async (req, res) => {
  const { sheetId } = req.params;
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${await getSheetNameById(auth, sheetId)}!A1:Z`,
    });

    const names = sheetData.data.values[0].map((name) => String(name));

    const scores = sheetData.data.values[1].map((score) => Number(score));

    const players = names.map(
      (name, index) => new PlayerScoreModel(index, name, scores[index])
    );

    res.json({ success: true, players });
  } catch (error) {
    res.status(error.status).send(`${error.message}`);
  }
});

async function createSheet(auth, spreadsheetId) {
  const today = moment().format("DD/MM/YYYY");

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

async function configSelectedSheet(auth, sheetId, players) {
  const sheets = google.sheets({ version: "v4", auth });

  await clearSheet(auth, sheetId);

  // Fill names to the first row
  const names = players.map((player) => player.name);

  const range = `${await getSheetNameById(auth, sheetId)}!A1`;

  sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [names],
    },
  });

  // Fill sum function
  const numColumns = names.length;

  const requests = [];
  for (let col = 0; col < numColumns; col++) {
    const colLetter = String.fromCharCode(65 + col); // Convert column index to letter (A, B, C, ...)
    const sumFormula = `=SUM(${colLetter}3:${colLetter})`;

    requests.push({
      updateCells: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: col,
          endColumnIndex: col + 1,
        },
        rows: [
          {
            values: [
              {
                userEnteredValue: {
                  formulaValue: sumFormula,
                },
              },
            ],
          },
        ],
        fields: "userEnteredValue",
      },
    });
  }

  // Change color of the second row to yellow
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 2,
        startColumnIndex: 0,
        endColumnIndex: numColumns,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: {
            red: 1,
            green: 1,
            blue: 0,
          },
        },
      },
      fields: "userEnteredFormat.backgroundColor",
    },
  });

  // Batch update the sheet with the sum formulas
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests,
    },
  });
}

async function clearSheet(auth, sheetId) {
  const sheets = google.sheets({ version: "v4", auth });

  // Clear all data in the sheet
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          updateCells: {
            range: {
              sheetId,
            },
            fields: "*",
          },
        },
      ],
    },
  });

  // Set all cells to white
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 1,
                  green: 1,
                  blue: 1,
                },
              },
            },
            fields: "userEnteredFormat.backgroundColor",
          },
        },
      ],
    },
  });
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

// Function get sheet name by id
async function getSheetNameById(auth, sheetId) {
  const sheets = google.sheets({ version: "v4", auth });

  const sheetData = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = sheetData.data.sheets.find(
    (sheet) => sheet.properties.sheetId === Number(sheetId)
  );

  return sheet.properties.title;
}

async function applyConditionalFormatting(auth, sheetId, initialScore, range) {
  const sheets = google.sheets({ version: "v4", auth });
  const requests = [
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: range.startRowIndex,
              endRowIndex: range.endRowIndex,
              startColumnIndex: range.startColumnIndex,
              endColumnIndex: range.endColumnIndex,
            },
          ],
          booleanRule: {
            condition: {
              type: "NUMBER_GREATER",
              values: [{ userEnteredValue: "0" }],
            },
            format: {
              backgroundColor: { red: 0, green: 1, blue: 0 },
            },
          },
        },
      },
    },

    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: range.startRowIndex,
              endRowIndex: range.endRowIndex,
              startColumnIndex: range.startColumnIndex,
              endColumnIndex: range.endColumnIndex,
            },
          ],
          booleanRule: {
            condition: {
              type: "NUMBER_LESS",
              values: [
                {
                  userEnteredValue: "0",
                },
              ],
            },
            format: {
              backgroundColor: { red: 1, green: 0, blue: 0 },
            },
          },
        },
      },
    },

    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId,
              startRowIndex: range.startRowIndex,
              endRowIndex: range.endRowIndex,
              startColumnIndex: range.startColumnIndex,
              endColumnIndex: range.endColumnIndex,
            },
          ],
          booleanRule: {
            condition: {
              type: "NUMBER_EQ",
              values: [{ userEnteredValue: (-initialScore).toString() }],
            },
            format: {
              backgroundColor: { red: 1, green: 1, blue: 1 },
            },
          },
        },
      },
    },
  ];

  await sheets.spreadsheets.batchUpdate({
    auth,
    spreadsheetId,
    resource: {
      requests,
    },
  });
}
