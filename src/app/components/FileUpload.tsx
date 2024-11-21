"use client";

import { useState } from "react";
import { Box, Button, Input, VStack, Text, Heading, useToast, Icon, Flex, List, ListItem } from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { chunkFile } from "@/utils/fileChunking";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "File too large",
          description: `Maximum file size is 50MB. Please reduce file size or split the document.`,
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
      const uploadResults = [];
      
      for (const file of files) {
        const chunks = await chunkFile(file);
        const totalChunks = chunks.length;
        const uploadedChunks = [];
        
        for (let i = 0; i < totalChunks; i++) {
          const formData = new FormData();
          formData.append("chunk", chunks[i]);
          formData.append("chunkIndex", i.toString());
          formData.append("totalChunks", totalChunks.toString());
          formData.append("fileName", file.name);
          formData.append("fileType", file.type);

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Chunk ${i + 1} upload failed`);
          }

          const result = await uploadResponse.json();
          uploadedChunks.push(result);
          setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
        }

        // Get the final file URL from the last chunk response
        const finalResult = uploadedChunks[uploadedChunks.length - 1];
        uploadResults.push(finalResult);
      }

      // Continue with processing
      const processResponse = await fetch(`/api/process?pdfUrl=${encodeURIComponent(uploadResults[0].key)}`, {
        method: "POST",
      });

      if (!processResponse.ok) {
        throw new Error("Processing failed");
      }

      const processResult = await processResponse.json();

      console.log("OpenAI GPT Call Output:", processResult);

      toast({
        title: "Success",
        description: "File processing finished!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to results page
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
          {isSubmitting && (
            <Text>{uploadProgress}% uploaded</Text>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default FileUpload;