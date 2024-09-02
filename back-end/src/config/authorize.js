const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();
const { productionRedirectUrl, developmentRedirectUrl } = require("./config");
const TOKEN_PATH = path.resolve(__dirname, 'token.json');

async function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'credentials.json')));
  const { client_secret, client_id } = credentials.web;
  if (!client_id || !client_secret) {
    throw new Error("Missing required credentials fields: 'client_id', 'client_secret'");
  }
  const redirect_uris = process.env.NODE_ENV === 'development' ? developmentRedirectUrl :  productionRedirectUrl;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris);
}

async function authorize() {
  const oAuth2Client = await getOAuth2Client();

  // Check if we have previously stored a token.
  let token;
  if (process.env.NODE_ENV === 'production') {
    token = process.env.GOOGLE_TOKEN; // Use environment variable for token in production
    if (!token) {
      throw new Error("Missing required environment variable: 'GOOGLE_TOKEN'");
    }
  } else {
    if (fs.existsSync(TOKEN_PATH)) {
      token = fs.readFileSync(TOKEN_PATH, 'utf8'); // Read token from file in development
    }
  }

  if (token) {
    oAuth2Client.setCredentials(JSON.parse(token));

    // Check if token is expired
    if (oAuth2Client.isTokenExpiring()) {
      try {
        const newToken = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(newToken.credentials);
        await getAndSaveToken(oAuth2Client, newToken.credentials);

      } catch (error) {
        throw new Error('Error refreshing access token: ' + error.message);
      }
    }
  }

  return oAuth2Client;
}

async function visitUrlToAuthorize() {
  const oAuth2Client = await getOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return authUrl;
}

async function getAndSaveToken(oAuth2Client, tokens) {
  oAuth2Client.setCredentials(tokens);
  // Store the token to environment variable or file
  if (process.env.NODE_ENV === 'production') {
    process.env.GOOGLE_TOKEN = JSON.stringify(tokens); // Save token to environment variable in production
  } else {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens)); // Save token to file in development
  }
}

module.exports = { authorize, visitUrlToAuthorize, getOAuth2Client, getAndSaveToken};
