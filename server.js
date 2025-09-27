// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json({ limit: '10mb' }));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("ERROR: OPENAI_API_KEY tidak ditemukan di .env");
  process.exit(1);
}

app.post('/generate', async (req, res) => {
  try {
    const { prompt, size = '512x512', n = 1 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt wajib diisi' });
    }

    const payload = {
      model: "gpt-image-1",
      prompt: prompt,
      n: n,
      size: size,
      response_format: "b64_json"
    };

    const apiRes = await axios.post(
      'https://api.openai.com/v1/images/generations',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const images = apiRes.data.data.map(item => item.b64_json);
    res.json({ images });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'gagal generate', detail: err.response?.data || err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server jalan di http://localhost:${port}`));
