import { NextResponse } from 'next/server';
import { openai } from '@/models/model';

export async function POST(request: Request) {
    try {
        const { userAnswer, correctAnswer, question, keyPoints } = await request.json();

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are an educational assistant evaluating student answers. Compare the student's answer to the required key points and provide specific feedback.
                    
                    If the answer:
                    1. Covers all key points thoroughly: Respond with "Correct:" followed by what made the answer strong
                    2. Misses key points or contains incorrect information: Respond with "Incorrect:" followed by what was missing or wrong
                    3. Is on the right track but needs elaboration: Respond with "Need More Detail:" followed by specific points to elaborate on
                    
                    Required key points: ${JSON.stringify(keyPoints)}`
                },
                {
                    role: "user",
                    content: `Question: ${question}
                    Correct Answer: ${correctAnswer}
                    Student Answer: ${userAnswer}
                    
                    Evaluate the answer's completeness and accuracy.`
                }
            ]
        });

        const feedback = completion.choices[0].message.content;
        const feedbackType = feedback?.startsWith("Need More Detail:") ? "need_detail" :
                           feedback?.startsWith("Incorrect:") ? "incorrect" : "correct";

        return NextResponse.json({ feedback, feedbackType });
    } catch (error) {
        console.error('Error validating answer:', error);
        return NextResponse.json(
            { error: 'Failed to validate answer' },
            { status: 500 }
        );
    }
} 