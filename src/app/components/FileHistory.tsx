"use client";

import { 
  Text, 
  Button, 
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Flex,
  Input,
  IconButton
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';

interface FileHistoryProps {
  userId: string;
}

interface File {
  _id: string;
  name: string;
  createdAt: string;
  quiz: string;
}

const FileHistory: React.FC<FileHistoryProps> = ({ userId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/files?userid=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch files');
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to load files: ${(error as Error).message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [userId, toast]);

  const handleRename = async (fileId: string, currentName: string) => {
    setEditingId(fileId);
    setNewName(currentName);
  };

  const saveNewName = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Failed to update name');

      setFiles(files.map(file => 
        file._id === fileId ? { ...file, name: newName } : file
      ));
      
      toast({
        title: 'Success',
        description: 'Quiz name updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update quiz name: ${(error as Error).message}`,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setEditingId(null);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (files.length === 0) return <Text>No quizzes found</Text>;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {files.map((file) => (
        <Card key={file._id} bg="white" borderRadius="xl" boxShadow="md">
          <CardHeader>
            {editingId === file._id ? (
              <Flex gap={2}>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  size="sm"
                />
                <IconButton
                  aria-label="Save name"
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  onClick={() => saveNewName(file._id)}
                />
                <IconButton
                  aria-label="Cancel"
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={() => setEditingId(null)}
                />
              </Flex>
            ) : (
              <Flex justify="space-between" align="center">
                <Heading size="md">{file.name}</Heading>
                <IconButton
                  aria-label="Edit name"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRename(file._id, file.name)}
                />
              </Flex>
            )}
          </CardHeader>
          <CardBody>
            <Text mb={4} color="gray.600">
              Created: {new Date(file.createdAt).toLocaleDateString()}
            </Text>
            <Button 
              colorScheme="blue"
              width="full"
              onClick={() => router.push(`/results/${file._id}`)}
            >
              View Quiz
            </Button>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default FileHistory;