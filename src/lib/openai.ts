import { openai } from '@/models/model';
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("clarity");

export const processPDF = async (fileKey: string, userId: string, questionType: 'multiple_choice' | 'short_answer' | 'mixed') => {
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
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a test writer creating exactly 10 questions based on provided content. 
          ${questionType === 'multiple_choice' ? 
            'Create only multiple choice questions. Each question MUST have exactly 4 answer choices, with exactly one correct answer.' :
            'Create only short answer questions. Each question MUST include a detailed correct answer and explanation for grading purposes.'
          }
          
          For short answer questions, format as:
          {
            "type": "short_answer",
            "question": "question text",
            "correct_answer": "detailed correct answer that covers all key points",
            "explanation": "explanation of why this answer is correct and what key points to look for",
            "key_points": ["point 1", "point 2", "point 3"]
          }

          Format your response as a JSON object with an array of questions.`
        },
        {
          role: 'user',
          content: `Analyze the following content and create exactly 10 questions based on the key concepts. Return the response as JSON: ${pdfContent}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = completion?.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error('Invalid response from OpenAI');
    }

    const parsedContent = JSON.parse(messageContent);
    const finalQuiz = { questions: parsedContent.questions };

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
