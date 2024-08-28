const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const TOKEN_PATH = path.resolve(__dirname, 'token.json');

async function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'credentials.json')));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  if (!client_id || !client_secret || !redirect_uris) {
    throw new Error("Missing required credentials fields: 'client_id', 'client_secret', 'redirect_uris'");
  }
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function authorize() {
  const oAuth2Client = await getOAuth2Client();

  // Check if we have previously stored a token.
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    return oAuth2Client;
  } else {
    // Get new token and save it
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    return oAuth2Client;
  }
}

async function getAndSaveToken(token) {
  const oAuth2Client = await getOAuth2Client();
  oAuth2Client.setCredentials(token);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to', TOKEN_PATH);
}

module.exports = { authorize, getOAuth2Client, getAndSaveToken};
