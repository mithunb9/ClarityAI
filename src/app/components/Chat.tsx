import { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Container,
  InputGroup,
  InputRightElement,
  Checkbox,
} from "@chakra-ui/react";
import ChatMessage from "./ChatMessage";

interface Message {
  text: string;
  isUser: boolean;
  sources?: string[];
}

interface ChatProps {
  fileId: string;
}

const Chat: React.FC<ChatProps> = ({ fileId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useContext, setUseContext] = useState(true);

  const handleSubmit = async () => {
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage,
          fileId,
          useContext,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [
        ...prev,
        {
          text: data.answer,
          isUser: false,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" h="100%">
      <VStack h="100%" spacing={4}>
        <Box
          flex={1}
          w="100%"
          overflowY="auto"
          p={4}
          borderWidth={1}
          borderRadius="lg"
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isUser={message.isUser}
              sources={message.sources}
            />  
          ))}   
        </Box>
        <InputGroup>
          <Checkbox
            isChecked={useContext}
            onChange={(e) => setUseContext(e.target.checked)}
            mb={2}
            pr={2}
          >
            RAG 
          </Checkbox>
          <Input
            pr="4.5rem"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chat with your document..."
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Send
            </Button>
          </InputRightElement>
        </InputGroup>
      </VStack>
    </Container>
  );
};

export default Chat;