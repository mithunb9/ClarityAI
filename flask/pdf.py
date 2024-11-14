import boto3
import pdfplumber
import io
import os
from dotenv import load_dotenv

load_dotenv()

boto3.setup_default_session(
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")

def extract_pdf_text_from_s3(file_key):
    try:
        s3 = boto3.client('s3')
        
        print(f"Attempting to download file: {file_key} from bucket: {BUCKET_NAME}")
        
        response = s3.get_object(Bucket=BUCKET_NAME, Key=file_key)
        pdf_content = response['Body'].read()

        with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
            text = ""
            # Extract text from each page
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error in extract_pdf_text_from_s3: {str(e)}")
        raise

file_key = "uploads/1731023360251-Goldman and Sibley.pdf"

