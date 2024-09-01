# File: backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Ensure CORS is imported
import os
from dotenv import load_dotenv
import requests

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Make sure CORS is properly configured

# Configure the PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://journal_user:Hello1!@localhost/journal_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the database model for journal entries
class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)

# Define the database model for journal prompts
class JournalPrompt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)

# Create the database tables within the application context
with app.app_context():
    db.create_all()

@app.route('/api/prompts', methods=['POST'])
def create_prompt():
    data = request.json
    title = data.get('title')

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    new_prompt = JournalPrompt(title=title)
    db.session.add(new_prompt)
    db.session.commit()

    return jsonify({'message': 'Prompt created successfully'}), 201

@app.route('/api/prompts', methods=['GET'])
def get_prompts():
    prompts = JournalPrompt.query.all()
    prompt_list = [{'id': prompt.id, 'title': prompt.title} for prompt in prompts]
    return jsonify(prompt_list), 200

@app.route('/api/journal', methods=['POST'])
def handle_journal():
    entry = request.json.get('entry')
    api_key = os.getenv('OPENAI_API_KEY')  # Make sure your environment variable is set correctly

    try:
        # Call OpenAI API
        ai_response = requests.post('https://api.openai.com/v1/chat/completions', json={
            "model": "gpt-3.5-turbo",  # Use a valid model
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Suggest a daily routine based on this journal entry: {entry}"}
            ],
            "max_tokens": 100
        }, headers={'Authorization': f'Bearer {api_key}'})

        if ai_response.status_code != 200:
            print(f"Failed to fetch from OpenAI: {ai_response.text}")
            return jsonify({'error': 'Failed to fetch from OpenAI'}), 500

        # Extract the assistant's reply from the response
        routine = ai_response.json().get('choices')[0].get('message').get('content').strip()

        # Save the journal entry and AI-generated routine to the database
        new_entry = JournalEntry(content=entry)
        db.session.add(new_entry)
        db.session.commit()

        return jsonify({'routine': routine})

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log the error
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
