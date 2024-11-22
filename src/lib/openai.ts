import { zodResponseFormat } from 'openai/helpers/zod';
import { Quiz, openai } from '../models/model';
import { MongoClient } from "mongodb";
import { chunkText } from '@/utils/textChunking';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export const processPDF = async (fileKey: string, userId: string) => {
  try {
    console.log('Starting PDF processing with fileKey:', fileKey);
    
    if (!fileKey) {
      throw new Error('PDF URL is required');
    }

    const response = await fetch(`${process.env.FLASK_API_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_key: fileKey }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to extract PDF text: ${errorData}`);
    }

    const data = await response.json();
    const pdfContent = data.text;
    
    // Split content into chunks
    const textChunks = chunkText(pdfContent);
    let allQuestions: typeof Quiz[] = [];

    // Process each chunk
    for (const chunk of textChunks) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a test writer who can write both multiple choice and short answer questions based on a PDF given. Create a mix of questions where multiple choice questions have 4 options each (only one correct), and short answer questions include a correct answer and explanation.',
          },
          {
            role: 'user',
            content: `Analyze the following content and create 2-3 questions based on the key concepts: ${chunk}`,
          },
        ],
        response_format: { type: "json_object" }
      });

      const messageContent = completion?.choices?.[0]?.message?.content;
      if (!messageContent) {
        throw new Error('Invalid response from OpenAI');
      }

      const parsedContent = JSON.parse(messageContent);
      allQuestions = [...allQuestions, ...parsedContent.questions];
    }

    const finalQuiz = { questions: allQuestions };

    const result = await db.collection('files').insertOne({
      userId,
      fileKey,
      text: pdfContent,
      createdAt: new Date(),
      quiz: JSON.stringify(finalQuiz),
    });

    return {
      quiz: finalQuiz,
      fileId: result.insertedId.toString()
    };
  } catch (error) {
    console.error('PDF processing error details:', error);
    throw error;
  }
};
