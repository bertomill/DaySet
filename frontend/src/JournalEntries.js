// File: frontend/src/JournalEntries.js
import React, { useState, useEffect } from 'react';
import './JournalEntries.css';  // Import the CSS file for styling

function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/journal-entries'); // Backend endpoint to get journal entries
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      setError('Error fetching journal entries: ' + error.message);
    }
  };

  return (
    <div className="journal-entries-container">
      <h2>Journal Entries</h2>
      {error && <p className="error">{error}</p>}
      {entries.length > 0 ? (
        <div className="journal-entries">
          {entries.map((entry) => (
            <div key={entry.id} className="journal-entry-card">
              <h3>Entry:</h3>
              <p className="entry-content">{entry.content}</p>
              {entry.routine && (
                <p className="entry-routine">
                  <strong>Routine:</strong> {entry.routine}
                </p>
              )}
              <p className="entry-timestamp">
                <strong>Created on:</strong> {new Date(entry.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No journal entries found.</p>
      )}
    </div>
  );
}

export default JournalEntries;
