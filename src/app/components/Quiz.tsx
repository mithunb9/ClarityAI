import { FC } from "react";
import AnswerChoice from "./AnswerChoice";
import { Box, Text, VStack } from "@chakra-ui/react";

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
        <VStack spacing={6} align="stretch">
            {quiz.questions.map((question, questionIndex: number) => (
                <Box key={questionIndex} p={4} borderWidth={1} borderRadius="lg">
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                        {questionIndex + 1}. {question.question}
                    </Text>
                    <VStack spacing={3} align="stretch">
                        {question.answer_choices.map((choice, choiceIndex: number) => (
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
    );
};

export default QuizComponent;