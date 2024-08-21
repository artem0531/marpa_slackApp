const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const SLACK_TOKEN = 'xoxb-7535431659605-7608568484948-KABrfRX7TTgYIPhA5CB7Befb'; // Replace with your Bot User OAuth Token from Slack
const OPENAI_API_KEY = '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'; // Replace with your OpenAI API key

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