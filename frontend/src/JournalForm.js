// File: frontend/src/JournalForm.js
import React, { useState, useEffect } from 'react';

function JournalForm() {
  const [entry, setEntry] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPromptTitle }),
      });

      if (response.ok) {
        setNewPromptTitle('');
        fetchPrompts();
        alert('Prompt created successfully!');
      } else {
        alert('Failed to create prompt.');
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponseMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      const data = await response.json();
      if (data.routine) {
        setResponseMessage(data.routine);
      } else {
        setResponseMessage('No routine generated.');
      }
    } catch (error) {
      setError('Error submitting journal entry: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Create Journal Prompt</h1>
      <form onSubmit={handleCreatePrompt}>
        <input
          type="text"
          value={newPromptTitle}
          onChange={(e) => setNewPromptTitle(e.target.value)}
          placeholder="Prompt Title"
          required
        />
        <button type="submit">Create Prompt</button>
      </form>

      <h2>Fill Out Journal</h2>
      <form onSubmit={handleSubmit}>
        <select value={selectedPrompt} onChange={(e) => setSelectedPrompt(e.target.value)}>
          <option value="">Select a Prompt</option>
          {prompts.map((prompt) => (
            <option key={prompt.id} value={prompt.title}>
              {prompt.title}
            </option>
          ))}
        </select>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Enter your journal entry"
          rows="5"
        />
        <button type="submit">Submit</button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
}

export default JournalForm;
