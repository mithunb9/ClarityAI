export const CHUNK_SIZE = 12000; // Roughly 12k characters per chunk for GPT-4

export const chunkText = (text: string): string[] => {
  const chunks: string[] = [];
  let currentChunk = "";
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > CHUNK_SIZE) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}; 