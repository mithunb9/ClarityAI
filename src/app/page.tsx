"use client";

import { useSession } from "next-auth/react";
import FileUpload from "./components/FileUpload";
import { 
  Container, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  useColorModeValue,
  Grid,
  GridItem
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import FileHistory from "./components/FileHistory";

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
              // eslint-disable-next-line @next/next/no-img-element
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
      <Grid templateColumns="repeat(2, 1fr)" gap={8}>
        <GridItem>
          <FileUpload />
        </GridItem>
        <GridItem>
          <FileHistory userId={session.user.id} />
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Home;
