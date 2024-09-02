# File: backend/app.py

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate  # Import Flask-Migrate
import os
from dotenv import load_dotenv
import requests
from sqlalchemy import func

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure the PostgreSQL database using environment variable
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://journal_user:Hello1!@localhost/journal_app')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Define the database model for journal entries
class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    routine = db.Column(db.Text)
    timestamp = db.Column(db.DateTime(timezone=True), server_default=func.now())  # Add timestamp field

class Prompt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)

# Create the database tables within the application context
with app.app_context():
    db.create_all()

@app.route('/api/prompts', methods=['POST'])
def create_prompt():
    title = request.json.get('title')
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    new_prompt = Prompt(title=title)
    db.session.add(new_prompt)
    db.session.commit()
    return jsonify({'message': 'Prompt created successfully!', 'prompt': {'id': new_prompt.id, 'title': new_prompt.title}}), 201

@app.route('/api/prompts', methods=['GET'])
def get_prompts():
    prompts = Prompt.query.all()
    return jsonify([{'id': prompt.id, 'title': prompt.title} for prompt in prompts])

@app.route('/api/journal-combined', methods=['POST'])
def handle_combined_journal():
    entries = request.json.get('entries')
    
    if not entries or not isinstance(entries, list):
        return jsonify({'error': 'Entries should be a non-empty list'}), 400

    # Combine all entries into one text
    combined_text = ' '.join(entries)

    # Save the combined entry to the database
    new_entry = JournalEntry(content=combined_text)
    db.session.add(new_entry)
    db.session.commit()

    # Call OpenAI API with combined text
    api_key = os.getenv('OPENAI_API_KEY')  # Load your OpenAI API key from environment variable
    if not api_key:
        return jsonify({'error': 'API key is not configured'}), 500

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    data = {
        "model": "gpt-3.5-turbo",  # Use the appropriate model
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that suggests daily routines."},
            {"role": "user", "content": f"Based on this combined journal entry, suggest a daily routine: {combined_text}"}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }

    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers=headers,
        json=data
    )

    if response.status_code == 200:
        routine = response.json().get('choices')[0].get('message').get('content')
        # Update the journal entry with the generated routine
        new_entry.routine = routine
        db.session.commit()  # Save the generated routine to the database
    else:
        return jsonify({'error': 'Failed to fetch routine from OpenAI API'}), 500

    return jsonify({'routine': routine})

@app.route('/api/journal-entries', methods=['GET'])
def get_journal_entries():
    entries = JournalEntry.query.order_by(JournalEntry.timestamp.desc()).all()  # Order by timestamp descending
    entries_list = [{'id': entry.id, 'content': entry.content, 'routine': entry.routine, 'timestamp': entry.timestamp} for entry in entries]
    return jsonify(entries_list)

if __name__ == '__main__':
    app.run(debug=True)
