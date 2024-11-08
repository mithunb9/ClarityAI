import { filesCollection } from "./mongodb";

const addFile = async (key: string) => {
    const file = await filesCollection.findOne({ key });
    
    if (file) {
        return file;
    }
};