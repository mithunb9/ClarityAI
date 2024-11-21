import { FC } from "react";
import AnswerChoice from "./AnswerChoice";
import { Box, Text, VStack, Container, Heading } from "@chakra-ui/react";

interface QuizProps {
    quiz: {
        questions: Array<{
            question: string;
            answer_choices: Array<{
                content: string;
                correct: boolean;
            }>;
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
                    <Box 
                        key={questionIndex} 
                        p={6} 
                        borderWidth={1} 
                        borderRadius="lg" 
                        boxShadow="sm"
                        bg="white"
                    >
                        <Text fontSize="xl" fontWeight="bold" mb={4}>
                            {questionIndex + 1}. {question.question}
                        </Text>
                        <VStack spacing={4} align="stretch">
                            {question.answer_choices.map((choice, choiceIndex) => (
                                <AnswerChoice
                                    key={choiceIndex}
                                    content={choice.content}
                                    correct={choice.correct}
                                    index={choiceIndex}
                                />
                            ))}
                        </VStack>
                    </Box>
                ))}
            </VStack>
        </Container>
    );
};

export default QuizComponent;