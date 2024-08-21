const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const SLACK_TOKEN = process.env.SLACK_TOKEN
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

app.use(bodyParser.json());

app.post('/slack/events', async (req, res) => {
  const { type, event } = req.body;

  // Respond to Slack's URL verification challenge
  if (type === 'url_verification') {
    res.status(200).send({ challenge: req.body.challenge });
    return;
  }

  // Handle the event
  if (type === 'event_callback') {
    if (event && event.type === 'message' && event.text) {
      
      // Send message to OpenAI
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: event.text }]
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const reply = response.data.choices[0].message.content;

      // Respond back on Slack
      await axios.post('https://slack.com/api/chat.postMessage', {
        channel: event.channel,
        text: reply
      }, {
        headers: {
          'Authorization': `Bearer ${SLACK_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
    }

    res.status(200).send();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});