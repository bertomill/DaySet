// File: frontend/src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import JournalForm from './JournalForm';
import JournalEntries from './JournalEntries';
import WeeklyPlanner from './WeeklyPlanner';
import { sayings } from './Sayings'; // Import sayings from Sayings.js
import './App.css';

function App() {
  // State to hold the current saying
  const [currentSaying, setCurrentSaying] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Function to set a random saying initially
    const setRandomSaying = () => {
      const randomIndex = Math.floor(Math.random() * sayings.length);
      setCurrentSaying(sayings[randomIndex]);
      setCurrentIndex(randomIndex);
    };

    setRandomSaying();

    // Change the saying every 30 seconds
    const interval = setInterval(handleNextSaying, 30000);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, []);

  // Function to go to the next saying
  const handleNextSaying = () => {
    const nextIndex = (currentIndex + 1) % sayings.length;
    setCurrentSaying(sayings[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  return (
    <Router>
      <div>
        {/* Header Section */}
        <header className="header">
          <h1 className="app-title">DaySet</h1>
          <nav>
            <Link to="/" style={{ marginRight: '15px', color: '#ffffff' }}>Home</Link>
            <Link to="/entries" style={{ marginRight: '15px', color: '#ffffff' }}>View Entries</Link>
            <Link to="/planner" style={{ color: '#ffffff' }}>Weekly Planner</Link>
          </nav>
        </header>

        {/* Motivational Saying Section */}
        <div className="saying-section" onClick={handleNextSaying}>
          <p className="saying">{currentSaying}</p>
        </div>

        {/* Main Content */}
        <div className="App">
          <section>
            <Routes>
              <Route path="/" element={<JournalForm />} />
              <Route path="/entries" element={<JournalEntries />} />
              <Route path="/planner" element={<WeeklyPlanner />} />
            </Routes>
          </section>
        </div>
      </div>
    </Router>
  );
}

export default App;
