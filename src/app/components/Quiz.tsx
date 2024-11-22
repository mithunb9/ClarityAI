import { FC } from "react";
import AnswerChoice from "./AnswerChoice";
import ShortAnswerQuestion from "./ShortAnswerQuestion";
import { Box, VStack, Container, Heading, Text } from "@chakra-ui/react";

interface QuizProps {
    quiz: {
        questions: Array<{
            type: 'multiple_choice' | 'short_answer';
            question: string;
            answer_choices?: Array<{
                content: string;
                correct: boolean;
            }>;
            correct_answer?: string;
            explanation?: string;
        }>;
    };
}

const QuizComponent: FC<QuizProps> = ({ quiz }) => {
    return (
        <Container maxW="container.lg" py={8}>
            <VStack spacing={8} align="stretch">
                <Heading size="xl" textAlign="center" mb={6}>
                    My Questions
                </Heading>
                {quiz.questions.map((question, questionIndex) => (
                    question.type === 'multiple_choice' ? (
                        <Box 
                            key={questionIndex} 
                            p={6} 
                            borderWidth={1} 
                            borderRadius="lg" 
                            boxShadow="sm"
                            bg="white"
                        >
                            <Text fontWeight="bold" mb={4}>
                                Question {questionIndex + 1}: {question.question}
                            </Text>
                            <VStack spacing={3} align="stretch">
                                {question.answer_choices?.map((choice, index) => (
                                    <AnswerChoice
                                        key={index}
                                        content={choice.content}
                                        correct={choice.correct}
                                        index={index}
                                    />
                                ))}
                            </VStack>
                        </Box>
                    ) : (
                        <ShortAnswerQuestion
                            key={questionIndex}
                            questionNumber={questionIndex + 1}
                            question={question.question}
                            correctAnswer={question.correct_answer || ""}
                            explanation={question.explanation || ""}
                        />
                    )
                ))}
            </VStack>
        </Container>
    );
};

export default QuizComponent;