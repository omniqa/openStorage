const express = require('express');
const { google } = require('googleapis');
const OAuth2Data = require('./credentials.json');

const app = express();
const PORT = 3000;

const oAuth2Client = new google.auth.OAuth2(
  OAuth2Data.web.client_id,
  OAuth2Data.web.client_secret,
  OAuth2Data.web.redirect_uris[0]
);

let authed = false;

app.get('/', (req, res) => {
  if (!authed) {
    const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/drive.metadata.readonly'
    });
    res.send(`<h1>Authentication using google oAuth</h1><a href="${url}">Login</a>`);
  } else {
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)'
    }, (err, response) => {
      if (err) return res.status(500).send('The API returned an error: ' + err);
      const files = response.data.files;
      if (files.length) {
        res.send(`<h1>Files:</h1><ul>${files.map(file => `<li>${file.name} (${file.id})</li>`).join('')}</ul>`);
      } else {
        res.send('No files found.');
      }
    });
  }
});

app.get('/auth/google/callback', (req, res) => {
  const code = req.query.code;
  if (code) {
    oAuth2Client.getToken(code, (err, tokens) => {
      if (err) return res.status(400).send('Error retrieving access token');
      oAuth2Client.setCredentials(tokens);
      authed = true;
      res.redirect('/');
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
