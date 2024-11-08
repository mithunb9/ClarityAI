"use client";

import { useSession } from "next-auth/react";
import FileUpload from "./components/FileUpload";
import { 
  Box, 
  Container, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  useColorModeValue 
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";

const Home: React.FC = () => {
  const { data: session } = useSession();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  if (!session) {
    return (
      <Container maxW="container.xl" py={20}>
        <VStack 
          spacing={8} 
          bg={bgColor} 
          p={10} 
          borderRadius="xl" 
          boxShadow="sm"
          textAlign="center"
        >
          <Heading size="2xl">Welcome to ClarityAI</Heading>
          <Text fontSize="xl" color="gray.600">
            Please sign in to continue
          </Text>
          <Button
            size="lg"
            colorScheme="blue"
            onClick={() => signIn("google")}
            leftIcon={
              <img 
                src="https://authjs.dev/img/providers/google.svg" 
                alt="Google" 
                style={{ width: '20px', height: '20px' }}
              />
            }
          >
            Sign in with Google
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <FileUpload />
    </Container>
  );
};

export default Home;
