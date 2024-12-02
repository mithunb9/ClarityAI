import { FC, useState } from "react";
import { Box, Text, Input, Button, VStack, useToast, Flex } from "@chakra-ui/react";
import { InfoIcon, WarningIcon, CheckIcon } from "@chakra-ui/icons";
import RecordButton from "./RecordButton";

interface ShortAnswerQuestionProps {
    questionNumber: number;
    question: string;
    correctAnswer: string;
    explanation: string;
    keyPoints: string[];
}

const ShortAnswerQuestion: FC<ShortAnswerQuestionProps> = ({ 
    questionNumber,
    question, 
    correctAnswer,
    explanation,
    keyPoints
}) => {
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<"need_detail" | "incorrect" | "correct" | null>(null);
    const toast = useToast();

    const handleSubmit = async () => {
        if (!answer.trim()) {
            toast({
                title: "Error",
                description: "Please enter an answer",
                status: "error",
                duration: 3000,
            });
            return;
        }

        try {
            const response = await fetch('/api/validate-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userAnswer: answer,
                    correctAnswer,
                    question,
                    keyPoints
                }),
            });

            const data = await response.json();
            setFeedback(data.feedback);
            
            if (data.feedback.startsWith("Need More Detail:")) {
                setFeedbackType("need_detail");
            } else if (data.feedback.startsWith("Incorrect:")) {
                setFeedbackType("incorrect");
            } else {
                setFeedbackType("correct");
            }
        } catch {
            toast({
                title: "Error", 
                description: "Failed to validate answer",
                status: "error",
                duration: 3000,
            });
        }
    };

    const getFeedbackColor = () => {
        switch (feedbackType) {
            case "need_detail": return "blue.100";
            case "incorrect": return "red.100";
            case "correct": return "green.100";
            default: return "gray.100";
        }
    };

    const getFeedbackIcon = () => {
        switch (feedbackType) {
            case "need_detail": return <InfoIcon color="blue.500" />;
            case "incorrect": return <WarningIcon color="red.500" />;
            case "correct": return <CheckIcon color="green.500" />;
            default: return null;
        }
    };

    const formatFeedbackText = (text: string) => {
        let formattedText = text;
        
        keyPoints.forEach(point => {
            formattedText = formattedText.replace(point, `<b>${point}</b>`);
        });

        return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
    };

    return (
        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" bg="white">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                {questionNumber}. {question}
            </Text>
            <VStack spacing={4} align="stretch">
                <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    isDisabled={feedbackType === "correct"}
                />

                <RecordButton onTranscriptionComplete={(text) => setAnswer(text)} />

                {feedbackType !== "correct" && (
                    <Button 
                        colorScheme={feedbackType === "need_detail" ? "blue" : "blue"} 
                        onClick={handleSubmit}
                    >
                        {feedbackType === "need_detail" ? "Submit Updated Answer" : "Submit Answer"}
                    </Button>
                )}
                {feedback && (
                    <Box 
                        p={4} 
                        bg={getFeedbackColor()}
                        borderRadius="md"
                        borderWidth={1}
                        borderColor={feedbackType === "need_detail" ? "blue.300" : 
                                   feedbackType === "incorrect" ? "red.300" : "green.300"}
                    >
                        <Flex gap={2} align="flex-start">
                            <Box pt={1}>
                                {getFeedbackIcon()}
                            </Box>
                            <VStack align="stretch" spacing={2}>
                                <Text>
                                    {formatFeedbackText(feedback)}
                                </Text>
                                {feedbackType === "incorrect" && (
                                    <Text fontWeight="medium" mt={2}>
                                        Correct Answer: {correctAnswer}
                                    </Text>
                                )}
                                {feedbackType === "correct" && (
                                    <Text mt={2} fontStyle="italic">
                                        {explanation}
                                    </Text>
                                )}
                            </VStack>
                        </Flex>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default ShortAnswerQuestion;