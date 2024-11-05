"use client";

import { useEffect, useState } from "react";
import { Box, VStack, Heading, Text, Spinner, Button, useToast } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";

interface Question {
  type: "multiple_choice" | "open_ended";
  question: string;
  options?: string[];
  answer?: string;
}

export default function ResultsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const pollResults = async () => {
    try {
      const response = await fetch(`/api/results/${params.threadId}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      
      const data = await response.json();
      
      if (data.status === "completed") {
        setQuestions(data.questions);
        setLoading(false);
      } else if (data.status === "processing") {
        // Continue polling
        setTimeout(pollResults, 2000);
      } else {
        throw new Error("Processing failed");
      }
    } catch (err) {
      setError("Failed to load questions");
      setLoading(false);
    }
  };

  useEffect(() => {
    pollResults();
  }, [params.threadId]);

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Generating your study questions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="red.500">{error}</Text>
        <Button onClick={() => router.push("/")} mt={4}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Your Study Questions</Heading>
        {questions.map((question, index) => (
          <Box key={index} p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
            <Text fontWeight="bold" mb={4}>
              {index + 1}. {question.question}
            </Text>
            {question.type === "multiple_choice" && question.options && (
              <VStack align="stretch" pl={4}>
                {question.options.map((option, optIndex) => (
                  <Text key={optIndex}>{String.fromCharCode(65 + optIndex)}. {option}</Text>
                ))}
              </VStack>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
} 