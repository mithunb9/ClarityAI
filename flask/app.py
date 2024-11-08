from flask import Flask, jsonify, request
from flask_cors import CORS
from pdf import extract_pdf_text_from_s3

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the Flask API'})

@app.route('/extract', methods=['POST'])
def extract():
    try:
        data = request.json
        if not data or 'file_key' not in data:
            return jsonify({'error': 'No file_key provided'}), 400
            
        file_key = data.get('file_key')
        text = extract_pdf_text_from_s3(file_key)
        
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

