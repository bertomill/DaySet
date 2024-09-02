// File: frontend/src/JournalForm.js
import React, { useState, useEffect } from 'react';

function JournalForm() {
  const [prompts, setPrompts] = useState([]);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [responses, setResponses] = useState({});
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
        const createdPrompt = await response.json();
        setNewPromptTitle('');
        setPrompts([...prompts, createdPrompt.prompt]); // Update the list with the new prompt
        setResponses({ ...responses, [createdPrompt.prompt.id]: '' }); // Initialize response field for the new prompt
        alert('Prompt created successfully!');
      } else {
        alert('Failed to create prompt.');
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleResponseChange = (promptId, value) => {
    setResponses({ ...responses, [promptId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponseMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/journal-combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: Object.values(responses) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      const data = await response.json();
      setResponseMessage(data.routine);
    } catch (error) {
      setError('Error submitting journal entry: ' + error.message);
    }
  };

  return (
    <div>
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
        {prompts.map((prompt) => (
          <div key={prompt.id}>
            <h3>{prompt.title}</h3>
            <textarea
              value={responses[prompt.id] || ''}
              onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
              placeholder={`Enter response for "${prompt.title}"`}
              rows="3"
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {responseMessage && <div dangerouslySetInnerHTML={{ __html: responseMessage }} />}
    </div>
  );
}

export default JournalForm;
