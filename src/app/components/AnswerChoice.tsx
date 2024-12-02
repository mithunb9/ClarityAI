import { FC, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { IoCheckmarkCircleOutline as Checkmark, IoCloseCircleOutline as X } from "react-icons/io5";

interface AnswerChoiceProps {
    content: string;
    correct: boolean;
    index: number;
    explanation?: string; // Add explanation prop
}

const AnswerChoice: FC<AnswerChoiceProps> = ({ content, correct, index, explanation }) => {
    const [isClicked, setIsClicked] = useState(false);
    const letter = String.fromCharCode(65 + index);

    return (
        <Box 
            onClick={() => setIsClicked(true)}
            backgroundColor={isClicked ? (correct ? "green.100" : "red.100") : "gray.50"}
            p={4}
            borderRadius="md"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: isClicked ? undefined : "gray.100" }}
            border="1px solid"
            borderColor={isClicked ? (correct ? "green.300" : "red.300") : "gray.200"}
        >
            <Flex alignItems="center" justifyContent="space-between" width="100%">
                <Flex alignItems="center" gap={3}>
                    <Text fontSize="lg" fontWeight="medium">
                        {letter}.
                    </Text>
                    <Text fontSize="lg">{content}</Text>
                </Flex>
                {isClicked && (
                    <Box color={correct ? "green.500" : "red.500"}>
                        {correct ? 
                            <Checkmark size={24} /> : 
                            <X size={24} />
                        }
                    </Box>
                )}
            </Flex>
            {isClicked && !correct && explanation && (
                <Text mt={2} color="red.600" fontSize="md">
                    {explanation}
                </Text>
            )}
        </Box>
    );
};  

export default AnswerChoice;