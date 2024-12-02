import { Box, Text, Flex, Button, Collapse, useDisclosure } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  sources?: string[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, sources }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"} mb={4}>
      <Box
        maxW="70%"
        bg={isUser ? "blue.900" : "gray.800"}
        color="white"
        p={3}
        borderRadius="lg"
      >
        <Text>{message}</Text>
        {!isUser && sources && sources.length > 0 && (
          <Box mt={2} border="1px solid" borderRadius="lg">
            <Button
              rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={onToggle}
              variant="ghost"
              size="sm"
              color="gray.200"
              _hover={{ bg: "gray.700" }}
              width="100%"
              justifyContent="space-between"
            >
              Sources
            </Button>
            <Collapse in={isOpen}>
              <Box pt={2}>
                {sources.map((source, index) => (
                  <Text key={index} fontSize="sm" color="gray.200" pl={2}>
                    {source}
                  </Text>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default ChatMessage;