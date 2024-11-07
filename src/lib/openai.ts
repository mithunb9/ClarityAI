import OpenAI from 'openai';
import axios from 'axios';
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

export const processPDF = async (pdfUrl: string) => {
    let pdfContent;
    
    try {
        if (!pdfUrl) {
            throw new Error("PDF URL is required");
        }

        // Fetch PDF from URL
        const response = await axios.get(pdfUrl, {
            responseType: 'arraybuffer'
        });
        const pdfBuffer = Buffer.from(response.data);

        // Parse PDF with error handling
        const pdfData = await pdf(pdfBuffer);
        
        if (!pdfData || !pdfData.text) {
            throw new Error("Failed to extract text from PDF");
        }

        pdfContent = pdfData.text.trim(); // Remove extra whitespace

        if (!pdfContent) {
            throw new Error("Extracted PDF content is empty");
        }

        console.log("Successfully extracted PDF content length:", pdfContent.length);

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview", 
            messages: [
                { 
                    role: "system", 
                    content: "You are a test writer who can write questions based on a pdf given. Create multiple choice questions with 4 options each, where only one option is correct." 
                },
                {
                    role: "user",
                    content: `Analyze the following PDF content and create multiple choice questions based on the key concepts (no questions about the title or metadata): ${pdfContent}`,
                }
            ],
            response_format: zodResponseFormat(Quiz, "event"),
        });

        if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message || !completion.choices[0].message.content) {
            throw new Error("Invalid response from OpenAI");
        }

        return completion.choices[0].message.content;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.status, error.response?.statusText);
            if (error.response?.status === 404) {
                throw new Error(`PDF not found at URL: ${pdfUrl}`);
            } else if (error.response?.status === 403) {
                throw new Error(`Access denied to PDF at URL: ${pdfUrl}`);
            } else {
                throw new Error(`Error fetching PDF: ${error.message}`);
            }
        }

        console.error("PDF processing error:", error);
        throw error;
    }
};

// example usage
// processPDF('https://uploading-file.s3.us-east-2.amazonaws.com/uploads/1731006989738-study.pdf').then(result => {
//     if (result) {
//         const resultObj = JSON.parse(result);
//         console.log(JSON.stringify(resultObj, null, 2));
//     } else {
//         console.error("No result returned from the PDF processing.");
//     }
// }).catch(error => {
//     console.error("Error in processing PDF:", error);
// });