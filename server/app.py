from flask import Flask, jsonify, request
from flask_cors import CORS
from pdf import extract_pdf_text_from_s3
import traceback
import whisper
import os
import tempfile
from pathlib import Path


app = Flask(__name__)
CORS(app)

model = whisper.load_model("turbo")

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
            transcribed_audio = model.transcribe(temp_path)
            print(f'Transcribed text: {transcribed_audio["text"].strip()}')
            return jsonify({'text': transcribed_audio['text'].strip()})
        except Exception as e:  
            return jsonify({'error': 'Failed to transcribe audio'}), 500
    

if __name__ == '__main__':
    app.run(debug=True)
