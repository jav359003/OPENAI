const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { YoutubeTranscript } = require('youtube-transcript');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const Video = require('./models/Video');
const app = express();
const port = 5001;

// Use CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
  next();
});

app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    maxOutputTokens: 500,
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MongoDB_connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Validate YouTube URL
function isValidYouTubeUrl(url) {
  const regex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+$/;
  return regex.test(url.trim()); // trim the URL
}
// want to also get the youtube video title and then add that title as part of the information saved in each document for video?
async function generateSummary(transcriptText) {
  try {
    const result = await model.generateContent(`
  Please summarize the entire transcript, ensuring that all major topics are covered. The summary should be structured with clear formatting, including:

  - A concise title reflecting the main topic
  - Subheadings for subtopics
  - Bullet points for every thing
  - finish all sentences or details
  - Proper indentation and spacing for readability
  - Adequate spacing between sections for clarity and readability

  Here is the transcript: ${transcriptText}
`);

    const summary = result.response.text();
    if (!summary || summary.trim() === '') {
      throw new Error('Failed to generate summary');
    }
    return summary;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function saveVideoToDatabase(videoUrl, transcriptText, summary) {
  try {
    const video = new Video({ url: videoUrl, transcript: transcriptText, summary });
    await video.save();
    return video;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.post('/summarize', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
      return res.status(400).json({ error: 'Invalid video URL' });
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    const transcriptText = transcript.map(entry => entry.text).join(' ');
    const summary = await generateSummary(transcriptText);
    const video = await saveVideoToDatabase(videoUrl, transcriptText, summary);

    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/history', async (req, res)=> {
  try {
  const history = await Video.find({}, 'summary');
  res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
})
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});