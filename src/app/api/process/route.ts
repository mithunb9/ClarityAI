import { processPDF } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const pdfUrl = request.nextUrl.searchParams.get('pdfUrl');
    console.log(pdfUrl)
    if (!pdfUrl) {
      return NextResponse.json(
        { error: "PDF URL is required" },
        { status: 400 }
      );
    }
    
    console.log("Attempting to process PDF from URL:", pdfUrl);
    
    const parsedOutput = await processPDF(pdfUrl);
    
    console.log("PDF processed successfully");
    
    return NextResponse.json(parsedOutput, { status: 200 });
 
  } catch (error) {
    console.error("Error processing files:", error);
    return NextResponse.json(
      { 
        error: "Failed to process files.",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 