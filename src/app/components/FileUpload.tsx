"use client";

import { useState } from "react";
import { Box, Button, Input, VStack, Text, Heading, useToast, Icon, Flex, List, ListItem, Select } from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<"multiple_choice" | "short_answer">("multiple_choice");
  const toast = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "File too large",
          description: `Maximum file size is 50MB`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("questionType", questionType);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload failed`);
      }

      const result = await uploadResponse.json();

      console.log("Backend resp:", result);

      // Process the uploaded file
      const processResponse = await fetch(`/api/process?pdfUrl=${encodeURIComponent(result.key)}&questionType=${questionType}`, {
        method: "POST",
      });

      if (!processResponse.ok) {
        throw new Error("Processing failed");
      }

      const processResult = await processResponse.json();

      toast({
        title: "Success",
        description: "File uploaded and processed successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/results?fileid=${processResult.fileId}`);
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
    <Flex justify="center" align="center" minHeight="60vh" p={4}>
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
          <Select value={questionType} onChange={(e) => setQuestionType(e.target.value as "multiple_choice" | "short_answer")}>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="short_answer">Short Answer</option>
          </Select>
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
          {files.length > 0 && (
            <List spacing={3}>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <Text>{file.name}</Text>
                </ListItem>
              ))}
            </List>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default FileUpload;