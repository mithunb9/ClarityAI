import OpenAI from 'openai';
import axios from 'axios';
import { zodResponseFormat } from 'openai/helpers/zod';
import * as z from 'zod';
import pdf from 'pdf-parse';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AnswerChoice = z.object({
  correct: z.boolean(),
  content: z.string(),
});

const Question = z.object({
  question: z.string(),
  answer_choices: z.array(AnswerChoice),
});

const Quiz = z.object({
  questions: z.array(Question),
});

async function extractPdfContent(bucketName: string, fileKey: string): Promise<string> {
    if (!fileKey) throw new Error('Invalid PDF URL');

    try {
        console.log(`Attempting to retrieve file from bucket: ${bucketName}, key: ${fileKey}`);
        
        // Retrieve the PDF from S3 as a buffer
        const data = await s3.getObject({ Bucket: bucketName, Key: fileKey }).promise();
        console.log('PDF retrieved successfully');

        // Use pdf-parse to extract text from the PDF buffer
        const pdfData = await pdf(data.Body as Buffer);
        const pdfContent = pdfData.text.trim();

        return pdfContent;

    } catch (error: any) {
        if (error.code === 'NoSuchBucket') {
            console.error('Bucket does not exist:', bucketName);
        } else if (error.code === 'NoSuchKey') {
            console.error('File not found at key:', fileKey);
        } else if (error.code === 'AccessDenied') {
            console.error('Access denied to bucket or file. Check IAM permissions.');
        } else {
            console.error('Error reading PDF:', error);
        }
        throw error;
    }
}

  

export const processPDF = async (pdfUrl: string) => {
  try {
    if (!pdfUrl) {
      throw new Error('PDF URL is required');
    }

    const fileKey = 'uploads/1731020277819-study.pdf';
    const pdfContent = await extractPdfContent('nlpbucketmithun', fileKey);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a test writer who can write questions based on a PDF given. Create multiple choice questions with 4 options each, where only one option is correct.',
        },
        {
          role: 'user',
          content: `Analyze the following PDF content and create multiple choice questions based on the key concepts (no questions about the title or metadata): ${pdfContent}`,
        },
      ],
      response_format: zodResponseFormat(Quiz, 'quiz'),
    });

    const messageContent = completion?.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error('Invalid response from OpenAI');
    }

    return messageContent;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.status, error.response?.statusText);
      if (error.response?.status === 404) {
        throw new Error(`PDF not found at URL: ${pdfUrl}`);
      } else if (error.response?.status === 403) {
        throw new Error(`Access denied to PDF at URL: ${pdfUrl}`);
      } else {
        throw new Error(`Error fetching PDF: ${error.message}`);
      }
    }

    console.error('PDF processing error:', error);
    throw error;
  }
};

// example usage
// processPDF('https://example.com/path/to/pdf').then(result => {
//     if (result) {
//         const resultObj = JSON.parse(result);
//         console.log(JSON.stringify(resultObj, null, 2));
//     } else {
//         console.error("No result returned from the PDF processing.");
//     }
// }).catch(error => {
//     console.error("Error in processing PDF:", error);
// });
