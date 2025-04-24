const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// 【Webhook Verify 用】Zalo認証のために追加！
app.get('/webhook', (req, res) => {
  const verifyToken = 'your-verify-token';  // ← Zalo OAの設定と同じものを入れてね！
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully.');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('❌ Verification failed');
  }
});

// 【POST 受信 → Google Sheets に記録】
app.post('/webhook', async (req, res) => {
  try {
    const message = req.body.message?.text || 'No message';
    const senderId = req.body.sender?.id || 'No sender ID';
    const timestamp = new Date().toISOString();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = process.env.SHEET_ID;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, senderId, message]],
      },
    });

    console.log(`✅ Message saved: ${message}`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error writing to Google Sheets:', error);
    res.status(500).send('Error');
  }
});

// 【デフォルトのGET（確認用）】
app.get('/', (req, res) => {
  res.send('Zalo Webhook server is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
