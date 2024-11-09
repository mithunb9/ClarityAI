export async function savePDFContent(userId: string, fileKey: string, text: string) {
  const { filesCollection } = await getCollections();
  
  try {
    const result = await filesCollection.updateOne(
      { fileKey },
      {
        $set: {
          userId,
          text,
          updatedAt: new Date()
        },
        $setOnInsert: 
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return result;
  } catch (error) {
    console.error("Error saving PDF content:", error);
    throw error;
  }
} 