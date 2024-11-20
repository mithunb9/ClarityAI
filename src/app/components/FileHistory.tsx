"use client";

import { useState, useEffect } from "react";
import { Box, Text, VStack, Heading } from "@chakra-ui/react";
import FileHistoryItem from "./FileHistoryItem";

interface FileHistoryProps {
  userId: string;
}

interface FileRecord {
  _id: string;
  fileKey: string;
  name: string;
  type: string;
  createdAt: string;
  userId: string;
  text?: string;
  quiz?: string;
}

const FileHistory: React.FC<FileHistoryProps> = ({ userId }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/files?userid=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchFiles();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>Loading files...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="md" mb={4}>File History</Heading>
      {files.length === 0 ? (
        <Text>No files uploaded yet</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {files.map((file) => (
            <FileHistoryItem  
              key={file._id}
              id={file._id}
              name={file.name || file.fileKey.split('/').pop() || 'Unnamed file'}
              uploadedAt={file.createdAt}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default FileHistory;