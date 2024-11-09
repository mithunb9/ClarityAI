import { getCollections } from "./mongodb";

const addFile = async (key: string) => {
    const { filesCollection } = await getCollections();
    const file = await filesCollection.findOne({ key });
    
    if (file) {
        return file;
    }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createOrUpdateUser(user: any) {
    const { usersCollection } = await getCollections();
    
    try {
      console.log('Attempting to create/update user:', user.email);
      const result = await usersCollection.updateOne(
        { email: user.email },
        {
          $set: {
            name: user.name,
            email: user.email,
            image: user.image,
            lastSignIn: new Date(),
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
      
      return result;
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw error;
    }
  }

