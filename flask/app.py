import boto3
import pdfplumber
import io
import os
from dotenv import load_dotenv

load_dotenv()

def extract_pdf_text_from_s3(file_key):
    # Initialize the S3 client
    s3 = boto3.client('s3')

    # Download the PDF file as a bytes object
    response = s3.get_object(Bucket=bucket_name, Key=file_key)
    pdf_content = response['Body'].read()

    # Open the PDF content with pdfplumber
    with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
        text = ""
        # Extract text from each page
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

bucket_name = os.getenv("AWS_S3_BUCKET_NAME")
file_key = "uploads/1731023360251-Goldman and Sibley.pdf"

try:
    pdf_text = extract_pdf_text_from_s3(file_key)
    print("Extracted PDF Text:\n", pdf_text)
except Exception as e:
    print("Failed to fetch or parse PDF:", e)
