import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: Request, { params }: { params: { threadId: string } }) {
  try {
    const { threadId } = await params;

    console.log("Fetching results for thread:", threadId);

    const thread = await openai.beta.threads.retrieve(threadId);
    const messages = await openai.beta.threads.messages.list(threadId);

    const lastAssistantMessage = messages.data
      .filter(message => message.role === 'assistant')
      .shift();

    if (!lastAssistantMessage) {
      console.log("Processing still in progress for thread:", threadId);
      return new Response(
        JSON.stringify({ status: "processing" }),
        { status: 200 }
      );
    }

    const questions = parseQuestionsFromMessage(lastAssistantMessage);

    console.log("Questions generated:", questions);

    return new Response(
      JSON.stringify({
        status: "completed",
        questions
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching results:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch results" }),
      { status: 500 }
    );
  }
}

function parseQuestionsFromMessage(message: any) {
  // This is a simple parser - you might need to adjust based on your Assistant's output format
  const questions = [];
  
  if (message.content && Array.isArray(message.content)) {
    for (const content of message.content) {
      if (content.type === 'text') {
        // Split the text into questions (this is a basic implementation)
        const questionTexts = content.text.value.split(/\d+\./g).filter(Boolean);
        
        for (const questionText of questionTexts) {
          // Check if it's multiple choice by looking for A), B), C) pattern
          const isMultipleChoice = questionText.match(/[A-D]\)/g);
          
          if (isMultipleChoice) {
            const [questionPart, ...optionsParts] = questionText.split(/[A-D]\)/g);
            questions.push({
              type: "multiple_choice",
              question: questionPart.trim(),
              options: optionsParts.map((opt: string) => opt.trim())
            });
          } else {
            questions.push({
              type: "open_ended",
              question: questionText.trim()
            });
          }
        }
      }
    }
  }

  return questions;
} 