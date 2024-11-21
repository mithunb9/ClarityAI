"use client";

import { useState, useCallback, useEffect } from 'react';
import { Box, Text, Button, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  userAnswer?: string;
}

interface QuizResponse {
  quiz: {
    id: string;
    title: string;
    questions: QuizQuestion[];
  };
}

interface ResultsPageProps {
  fileid?: string;
}

export default function ResultsPage({ fileid }: ResultsPageProps) {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchResults = useCallback(async () => {
    if (!fileid) return;
    
    try {
      const response = await fetch(`/api/results/?fileid=${fileid}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      
      const data = await response.json();
      setQuiz(data.quiz);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load quiz questions");
      setLoading(false);
    }
  }, [fileid]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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

  return (
    <Box>
      {/* Add your quiz rendering logic here */}
      {JSON.stringify(quiz)}
    </Box>
  );
} 