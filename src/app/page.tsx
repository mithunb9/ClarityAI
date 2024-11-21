"use client";

import { useSession } from "next-auth/react";
import { 
  Container, 
  Box, 
  Heading, 
  Text,
  VStack,
  Button,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import FileHistory from "./components/FileHistory";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Container maxW="container.xl" py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={6}>
          <Heading>Welcome to ClarityAI</Heading>
          <Text>Please sign in to continue</Text>
          <Button onClick={() => signIn("google")}>Sign in with Google</Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading>My Quizzes</Heading>
          <Text mt={2}>View and manage your quizzes</Text>
        </Box>
        <FileHistory userId={session.user.id} />
      </VStack>
    </Container>
  );
}
