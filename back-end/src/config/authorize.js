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

async function authorize(deviceInfoInput) {
  const oAuth2Client = await getOAuth2Client();

  // Check if we have previously stored a token.
  let tokenData;
  if (process.env.NODE_ENV === 'production') {
    tokenData = process.env.GOOGLE_TOKEN; // Use environment variable for token in production
    if (!tokenData) {
      throw new Error("Missing required environment variable: 'GOOGLE_TOKEN'");
    }
  } else {
    if (fs.existsSync(TOKEN_PATH)) {
      tokenData = fs.readFileSync(TOKEN_PATH, 'utf8'); // Read token from file in development
    }
  }

  if (tokenData) {
    tokenData = JSON.parse(tokenData);
    const { tokens, deviceInfo } = tokenData;

    // Check if device information matches
    if (deviceInfo !== deviceInfoInput) {
      throw new Error('Device mismatch. Re-authentication required.');
    }

    oAuth2Client.setCredentials(tokens);

    // Check if token is expired
    if (oAuth2Client.isTokenExpiring()) {
      try {
        const newToken = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(newToken.credentials);
        await getAndSaveToken(oAuth2Client, newToken.credentials, deviceInfo);
      } catch (error) {
        throw new Error('Error refreshing access token: ' + error.message);
      }
    }
  }

  return oAuth2Client;
}

async function logOut() {
  if (process.env.NODE_ENV === 'production') {
    delete process.env.GOOGLE_TOKEN;
  } else {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
  }
}

async function visitUrlToAuthorize() {
  const oAuth2Client = await getOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return authUrl;
}

async function getAndSaveToken(oAuth2Client, tokens, deviceInfo) {
  oAuth2Client.setCredentials(tokens);
  const tokenData = { tokens, deviceInfo };
  
  if (process.env.NODE_ENV === 'production') {
    process.env.GOOGLE_TOKEN = JSON.stringify(tokenData); // Save token to environment variable in production
  } else {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData)); // Save token to file in development
  }
}

module.exports = { authorize, logOut, visitUrlToAuthorize, getOAuth2Client, getAndSaveToken};
