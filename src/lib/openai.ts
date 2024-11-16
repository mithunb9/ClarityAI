import { zodResponseFormat } from 'openai/helpers/zod';
import { Quiz, openai } from '../models/model';
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export const processPDF = async (fileKey: string, userId: string) => {
  try {
    if (!fileKey) {
      throw new Error('PDF URL is required');
    }

    console.log('Sending request to Flask API:', `${process.env.FLASK_API_URL}/extract`);
    
    const response = await fetch(`${process.env.FLASK_API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_key: fileKey }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Flask API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to extract PDF text: ${errorData}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error('No text content returned from PDF extraction');
    }

    const pdfContent = data.text;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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

    const result = await db.collection('files').insertOne({
      userId,
      fileKey,
      text: pdfContent,
      createdAt: new Date(),
      quiz: messageContent,
    });

    return {
      quiz: messageContent,
      fileId: result.insertedId.toString()
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    throw error;
  }
};
