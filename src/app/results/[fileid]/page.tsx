"use client";

import { useEffect, useState } from "react";
import { Box, VStack, Heading, Text, Spinner, Button } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";

interface Question {
  question: string;
  answer_choices: {
    correct: boolean;
    content: string;
  }[];
}

interface QuizResponse {
  questions: Question[];
}

export default function ResultsPage() {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results/${params.fileid}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      
      const data = await response.json();

      console.log(data)
      
      setQuiz(data.quiz);
      setLoading(false);
    } catch (err) {
      setError("Failed to load quiz questions");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [params.fileid]);

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Loading your quiz questions...</Text>
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

  if (!quiz) {
    return (
      <Box textAlign="center" py={20}>
        <Text>No questions available</Text>
        <Button onClick={() => router.push("/")} mt={4}>
          Upload Another File
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Your Quiz Questions</Heading>
        {quiz.questions.map((question, index) => (
          <Box key={index} p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
            <Text fontWeight="bold" mb={4}>
              {index + 1}. {question.question}
            </Text>
            {question.answer_choices.map((choice, choiceIndex) => (
              <Text key={choiceIndex}>{String.fromCharCode(65 + choiceIndex)}. {choice.content}</Text>
            ))} 
          </Box>
        ))}
        <Button 
          colorScheme="blue" 
          onClick={() => router.push("/")}
          mx="auto"
        >
          Create Another Quiz
        </Button>
      </VStack>
    </Box>
  );
} 