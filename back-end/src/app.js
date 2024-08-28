const express = require('express');
const { google } = require('googleapis');
const { authorize, getOAuth2Client, getAndSaveToken } = require('./config/authorize');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const moment = require('moment');

// Route to handle OAuth2 callback
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const oAuth2Client = await getOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    await getAndSaveToken(tokens);
    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Error retrieving access token');
  }
});

app.post('/api/start-game', async (req, res) => {
  try {
    const auth = await authorize();
    const spreadsheetId = '10ioKPL3Y4jofGZCCMJoFpFsl4tk5XBX-LuFN3XZSVKs';

    const today = moment().format('DD/MM/YYYY');
    const sheetName = await createSheet(auth, spreadsheetId, today);

    res.json({ success: true, sheetName });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ success: false, error: 'Failed to start game' });
  }
});

async function createSheet(auth, spreadsheetId, today) {
  const sheets = google.sheets({ version: 'v4', auth });

  const sheetsList = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = sheetsList.data.sheets.map((sheet) => sheet.properties.title);

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
