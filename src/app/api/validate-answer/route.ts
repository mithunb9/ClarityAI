import { NextResponse } from 'next/server';
import { openai } from '@/models/model';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const response = await fetch(`${process.env.FLASK_API_URL}/validate-answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return NextResponse.json(result);
        
    } catch (error) {
        console.error('Error validating answer:', error);
        return NextResponse.json(
            { error: 'Failed to validate answer' },
            { status: 500 }
        );
    }
}