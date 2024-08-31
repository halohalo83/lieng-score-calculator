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
  console.log(process.env.NODE_ENV, 'process.env.NODE_ENV');
  const redirect_uris = process.env.NODE_ENV === 'development' ? developmentRedirectUrl :  productionRedirectUrl;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris);
}

async function authorize() {
  const oAuth2Client = await getOAuth2Client();

  // Check if we have previously stored a token.
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    return oAuth2Client;
  } else {
    console.log('Authorize this app by visiting this url:', await visitUrlToAuthorize());
    return oAuth2Client;
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

async function getAndSaveToken(token) {
  const oAuth2Client = await getOAuth2Client();
  oAuth2Client.setCredentials(token);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to', TOKEN_PATH);
}

module.exports = { authorize, visitUrlToAuthorize, getOAuth2Client, getAndSaveToken};
