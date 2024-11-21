export const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

export const chunkFile = async (file: File): Promise<Blob[]> => {
  const chunks: Blob[] = [];
  let start = 0;
  
  while (start < file.size) {
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    chunks.push(chunk);
    start = end;
  }
  
  return chunks;
};

export const mergeChunks = async (chunks: Blob[]): Promise<Blob> => {
  return new Blob(chunks, { type: chunks[0].type });
}; 