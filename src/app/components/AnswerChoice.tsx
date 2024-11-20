import {FC, useState} from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { IoCheckmarkCircleOutline as Checkmark, IoCloseCircleOutline as X } from "react-icons/io5";

interface AnswerChoiceProps {
    content: string;
    correct: boolean;
    index: number;
}

const AnswerChoice: FC<AnswerChoiceProps> = ({ content, correct, index }) => {
    const [isClicked, setIsClicked] = useState(false);
    const letter = String.fromCharCode(65 + index); 

    return (
        <Box 
            onClick={() => {
                setIsClicked(true);
            }}
            backgroundColor={isClicked ? (correct ? "green.200" : "red.200") : "transparent"}
            p={3}
            borderRadius="md"
            cursor="pointer"
            transition="background-color 0.2s"
        >
            <Flex alignItems="center" justifyContent="space-between" width="100%">
                <Flex alignItems="center">
                    <Text fontWeight="bold" mr={3}>
                        {letter}.
                    </Text>
                    <Text>{content}</Text>
                </Flex>
                {isClicked && (
                    correct ? 
                        <Checkmark size={20} color="black"  /> : 
                        <X size={20} color="black" />
                )}
            </Flex>
        </Box>
    );
};  

export default AnswerChoice;