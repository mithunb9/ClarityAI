import { NextResponse } from 'next/server';
import { openai } from '@/models/model';

export async function POST(request: Request) {
    try {
        const { userAnswer, correctAnswer, question } = await request.json();

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an educational assistant evaluating student answers. Analyze the response and provide one of three types of feedback:
                    1. If the answer is too vague or incomplete, respond with "Need More Detail:" followed by specific aspects the student should elaborate on.
                    2. If the answer is incorrect or partially incorrect, respond with "Incorrect:" followed by an explanation of which parts are wrong and why.
                    3. If the answer is correct, respond with "Correct:" followed by key points that make for a strong answer to this type of question.
                    
                    Be thorough in your analysis but concise in your response.`
                },
                {
                    role: "user",
                    content: `Question: ${question}
                    Correct Answer: ${correctAnswer}
                    Student Answer: ${userAnswer}
                    
                    Analyze the student's response for accuracy, completeness, and understanding.`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const feedback = completion.choices[0].message.content;
        const feedbackType = feedback?.startsWith("Need More Detail:") ? "need_detail" :
                           feedback?.startsWith("Incorrect:") ? "incorrect" : "correct";

        return NextResponse.json({ 
            feedback,
            feedbackType
        });
    } catch (error) {
        console.error('Error validating answer:', error);
        return NextResponse.json(
            { error: 'Failed to validate answer' },
            { status: 500 }
        );
    }
} 