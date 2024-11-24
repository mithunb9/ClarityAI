from flask import Flask, jsonify, request
from flask_cors import CORS
from pdf import extract_pdf_text_from_s3
import traceback
import whisper
import os
import tempfile
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
import numpy as np


app = Flask(__name__)
CORS(app)

MODEL = whisper.load_model("base")

# Load SpaCy model
nlp = spacy.load('en_core_web_lg')

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the Clarity API'})

@app.route('/extract', methods=['POST'])
def extract():
    print("Received request to extract text from PDF")
    
    try:
        data = request.json
        if not data or 'file_key' not in data:
            return jsonify({'error': 'No file_key provided'}), 400
            
        file_key = data.get('file_key')
        print(f"Received file_key: {file_key}")
        
        text = extract_pdf_text_from_s3(file_key)
        if not text:
            return jsonify({'error': 'Failed to extract text from PDF'}), 400
            
        return jsonify({'text': text})
    except Exception as e:
        print(f"Error in extract endpoint: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir) / "audio.webm"
        audio_file.save(temp_path)

        try:
            result = MODEL.transcribe(str(temp_path))
            return jsonify({'text': result['text'].strip()})
        except Exception as e:
            return jsonify({'error': 'Failed to transcribe audio'}), 500

@app.route('/validate-answer', methods=['POST'])
def validate_answer():
    try:
        data = request.json
        user_answer = data['userAnswer']
        correct_answer = data['correctAnswer']
        key_points = data['keyPoints']

        # Calculate similarity score
        similarity_score = calculate_similarity(user_answer, correct_answer)
        print
        
        # Analyze missing key points
        missing_points = analyze_missing_points(user_answer, key_points)
        
        # Determine feedback type and message
        if (similarity_score > 0.8):
            feedback_type = "correct"
            feedback = "Correct! Your answer covers the key points well."
        elif (similarity_score > 0.5):
            feedback_type = "need_detail"
            feedback = f"Need More Detail: Your answer is on the right track but missing: {', '.join(missing_points)}"
        else:
            feedback_type = "incorrect"
            feedback = f"Incorrect: Your answer needs improvement. Missing key points: {', '.join(missing_points)}"

        return jsonify({
            'feedback': feedback,
            'feedbackType': feedback_type,
            'similarityScore': similarity_score
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_similarity(text1, text2):
    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer().fit_transform([text1, text2])
    vectors = vectorizer.toarray()
    
    # Calculate cosine similarity
    return cosine_similarity(vectors[0:1], vectors[1:2])[0][0]

def analyze_missing_points(user_answer, key_points):
    missing = []
    doc = nlp(user_answer.lower())
    
    for point in key_points:
        point_doc = nlp(point.lower())
        max_similarity = max(token.similarity(point_doc) for token in doc)
        
        if max_similarity < 0.7:  # Threshold for considering a point as missing
            missing.append(point)
            
    return missing

if __name__ == '__main__':
    app.run(debug=True)
