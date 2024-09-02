// File: frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import JournalForm from './JournalForm';
import JournalEntries from './JournalEntries';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        {/* Header Section */}
        <header className="header">
          <h1 className="app-title">DaySet</h1>
          <nav>
            {/* Navigation Links */}
            <Link to="/" style={{ marginRight: '15px', color: '#ffffff' }}>Home</Link>
            <Link to="/entries" style={{ color: '#ffffff' }}>View Entries</Link>
          </nav>
        </header>

        {/* Main Content */}
        <div className="App">
          <section>
            <Routes>
              <Route path="/" element={<JournalForm />} />
              <Route path="/entries" element={<JournalEntries />} />
            </Routes>
          </section>
        </div>
      </div>
    </Router>
  );
}

export default App;
