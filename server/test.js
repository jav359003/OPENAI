require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { YoutubeTranscript } = require('youtube-transcript');
const Video = require('./models/Video');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb+srv://javinahuja18805:qSsKDOqB9dXZTqev@cluster0.dympgti.mongodb.net/Summaries?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 200,  // Limit to 200 tokens
  },
});

// Function to test video URL
const testVideoUrl = async () => {
  try {
    const videoUrl = 'https://www.youtube.com/watch?v=2siBrMsqF44';
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);

    if (!transcript || transcript.length === 0) {
      console.log('No transcript found for the video.');
      return;
    }

    const transcriptText = transcript.map((item) => item.text).join(' ');
    console.log('Transcript:', transcriptText);

    const result = await model.generateContent(`Summarize this text: ${transcriptText}`);
    const summary = await result.response.text();
    console.log('Summary:', summary);

    if (!summary || summary.trim() === '') {
      console.log('No summary generated.');
    } else {
      const video = new Video({ url: videoUrl, transcript: transcriptText, summary });
      await video.save();
      console.log('Video data saved to MongoDB.');
    }
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded. Consider reducing the number of requests.');
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Call testVideoUrl function
testVideoUrl();
