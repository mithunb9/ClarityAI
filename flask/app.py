from flask import Flask, jsonify, request
from pdf import extract_pdf_text_from_s3

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the Flask API'})

@app.route('/extract', methods=['POST'])
def extract():
    data = request.json
    file_key = data.get('file_key')
    text = extract_pdf_text_from_s3(file_key)
    
    return jsonify({'text': text})

if __name__ == '__main__':
    app.run(debug=True)

