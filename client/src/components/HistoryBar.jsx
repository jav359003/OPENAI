import React, { useState, useEffect } from 'react';
import sidebar from './sidebar.png';
import './HistoryBar.css';

function HistoryBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  }

  useEffect(() => {
    // Fetch history from the backend
    fetch('http://localhost:5001/history')
      .then(response => response.json())
      .then(data => {
        setHistoryItems(data);
      })
      .catch(error => {
        console.error('Error fetching history:', error);
      });
  }, []);

  return (
    <>
      <button className={`toggle-btn ${isOpen ? 'close' : ''}`} onClick={toggleSidebar}>
        {isOpen ? 'X' : 
        <img src={sidebar} alt="toggle-btn" />}
      </button>
      <div className={`history-bar ${isOpen ? 'open' : 'closed'}`}>
        <h2>History</h2>
        <ul>
          {historyItems.length > 0 ? (
            historyItems.map((item, index) => (
              <li key={index} className="history-item">
                <h6>{item.summary.split(' ').slice(0, 5).join(' ')}...</h6>
              </li>
            ))
          ) : (
            <li><p>No history available.</p></li>
          )}
        </ul>
        <button className='show-all-btn' onClick={togglePopup}>Show All Previous History</button>
        <div className="sidebar-options">
          <button>Sign in</button>
          <button>Sign up</button>
        </div>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Previous History</h2>
            <ul>
              {historyItems.map((item, index) => (
                <li key={index} className="popup-history-item">
                  <h6>{item.summary.split(' ').slice(0, 5).join(' ')}...</h6>
                  <p>{item.summary}</p>
                  <button onClick={() => navigator.clipboard.writeText(item.summary)}>Copy Summary</button>
                </li>
                ))}
            </ul>
            <button className="close-popup-btn" onClick={togglePopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default HistoryBar;