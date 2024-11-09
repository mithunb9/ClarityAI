import { MongoClient } from 'mongodb';
import { z } from 'zod';
import OpenAI from 'openai';

// Types
interface File {
    key: string;
    name: string;
    type: string;
}

interface User {
    id?: string;
    name?: string | null;
    email: string;
    image?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// Zod Schemas
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

export { type File, type User, openai, AnswerChoice, Question, Quiz };
