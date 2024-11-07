import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import {zodResponseFormat} from "openai/helpers/zod";
import z from "zod";
import pdf from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AnswerChoice = z.object({
    correct: z.boolean(),
    content: z.string(),
})

const Question = z.object({
    question: z.string(),
    answer_choices: z.array(AnswerChoice),
})

const Quiz = z.object({
    questions: z.array(Question),
})

export const processPDF = async (pdfPath: string) => {
    let dataBuffer = fs.readFileSync(pdfPath);
    let pdfContent;
    await pdf(dataBuffer).then(function(data) {
        pdfContent = data.text;
    });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a test writer who can write questions based on a pdf given." },
            {
              role: "user",
              content: `Analyze the following PDF content and write questions for it (no questions about the title or metadata): ${pdfContent}`,
          },
      ],
      response_format: zodResponseFormat(Quiz, "event"),
  });

  return completion.choices[0].message.content;
}

// example usage
processPDF('study4.pdf').then(result => {
    if (result) {
        const resultObj = JSON.parse(result);
        console.log(JSON.stringify(resultObj, null, 2));
    } else {
        console.error("No result returned from the PDF processing.");
    }
});