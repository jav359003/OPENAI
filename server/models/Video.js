const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    url: String,
    transcript: String,
    summary: String,
});

module.exports = mongoose.model("Video", videoSchema)