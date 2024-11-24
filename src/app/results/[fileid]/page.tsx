"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, VStack, Heading, Text, Spinner, Button } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import QuizComponent from "@/app/components/Quiz";

interface Question {
  question: string;
  type?: string;
  answer_choices: {
    correct: boolean;
    content: string;
  }[];
  correct_answer?: string;
  explanation?: string;
}

interface QuizResponse {
  questions: Question[];
  name: string;
}

export default function ResultsPage({ params }: { params: { fileid: string } }) {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/results/?fileid=${params.fileid}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      
      const data = await response.json();
      
      if (data.status === "processing") {
        setError("Quiz is still being generated. Please try again in a moment.");
        return;
      }
      
      setQuiz(data.quiz);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load quiz questions");
    } finally {
      setLoading(false);
    }
  }, [params.fileid]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">{error}</Text>;
  if (!quiz) return null;

  return <QuizComponent quiz={{
    questions: quiz.questions.map(q => ({
      ...q,
      type: (q.type || "multiple_choice") as "multiple_choice" | "short_answer"
    }))
  }} />;
}