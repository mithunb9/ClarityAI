"use client"; // Necessary because we are using hooks

import { useState } from "react";
import { Box, Button, Input, VStack, Text, Heading, useToast, Icon, Flex, List, ListItem } from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { useRouter } from 'next/navigation';

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Upload files
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }

      const uploadResult = await uploadResponse.json();

      console.log("Upload Result:", uploadResult);

      // Process files with OpenAI
      const processResponse = await fetch(`/api/process?pdfUrl=${encodeURIComponent(uploadResult.files[0].url)}`, {
        method: "POST",
      });

      if (!processResponse.ok) {
        throw new Error("Processing failed");
      }

      const processResult = await processResponse.json();

      console.log("OpenAI GPT Call Output:", processResult);

      toast({
        title: "Success",
        description: "Files uploaded and processing started!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to results page
      router.push(`/results/${processResult.threadId}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex justify="center" align="center" minHeight="80vh" p={4}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white" maxW="lg" width="100%">
        <VStack spacing={6}>
          <Heading as="h2" size="lg" textAlign="center" mb={4}>
            Upload Your Files
          </Heading>
          <Box
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            width="100%"
            textAlign="center"
            position="relative"
            cursor="pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                setFiles(Array.from(e.dataTransfer.files));
              }
            }}
          >
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              opacity={0}
              position="absolute"
              top={0}
              left={0}
              bottom={0}
              right={0}
              width="100%"
              height="100%"
              cursor="pointer"
            />
            <Text color="gray.500">Drag and drop files here, or click to select files</Text>
          </Box>
          <Button
            leftIcon={<Icon as={FiUpload} />}
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            width="full"
          >
            Upload
          </Button>
          {error && <Text color="red.500">{error}</Text>}
          <List spacing={3} width="100%">
            {files.map((file, index) => (
              <ListItem key={index} p={2} borderWidth={1} borderRadius="md" borderColor="gray.200">
                {file.name}
              </ListItem>
            ))}
          </List>
        </VStack>
      </Box>
    </Flex>
  );
};

export default FileUpload;