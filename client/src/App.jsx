import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HistoryBar from './components/HistoryBar';
import youtube from './assets/youtube.png';
import './index.css';

function App() {
  const [videoLink, setVideoLink] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "YouTube Video Summarizer";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
  const response = await axios.post('http://localhost:5001/summarize', {
    videoUrl: videoLink,
 });
      

      setSummary(response.data.summary);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setVideoLink(e.target.value);
  };

  return (
    <main className="main">
      <HistoryBar/>
      <img src={youtube} alt="YouTube" className="icon" />
      <h3>Summarize YouTube videos using AI</h3>
      
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="query"
          placeholder="Paste in video link"
          value={videoLink}
          onChange={handleInputChange}
        />
        <input type="submit" value="Generate Summary" disabled={loading} />
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {summary && (
    <div>
      <p className="result">{summary}</p>
      <button onClick={() => navigator.clipboard.writeText(summary)}>
        Copy Summary
      </button>
    </div>
  )}
    </main>
  );
}

export default App;