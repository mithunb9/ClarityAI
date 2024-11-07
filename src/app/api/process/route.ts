import OpenAI from 'openai';
import { processPDF } from '@/lib/openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { files } = await req.json();

    if (!files || files.length === 0) {
      console.error("No files provided to process.");
      return new Response(
        JSON.stringify({ error: "No files provided to process." }),
        { status: 400 }
      );
    }

    console.log("Files to process:", files);

    const assistant = await openai.beta.assistants.create({
      name: "Study Material Processor",
      instructions: "Generate study questions based on the provided materials. Focus on key concepts and create a mix of multiple choice and open-ended questions.",
      model: "gpt-4-turbo-preview",
    });

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: [
        {
          type: "text",
          text: "Please generate study questions based on these materials."
        },
        {
          type: "text",
          text: `File IDs: ${files.map((file: any) => file.key).join(', ')}`
        }
      ]
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    console.log("OpenAI GPT Call Output:", run);

    return new Response(
      JSON.stringify({ 
        message: "Processing started",
        threadId: thread.id,
        runId: run.id
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing files:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process files." }),
      { status: 500 }
    );
  }
} 