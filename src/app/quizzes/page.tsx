"use client";

import { Container, Heading } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import FileHistory from "@/app/components/FileHistory";

export default function QuizzesPage() {
  const { data: session } = useSession();

  if (!session?.user?.id) return null;

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6} textAlign="center">My Quizzes</Heading>
      <FileHistory userId={session.user.id} />
    </Container>
  );
}