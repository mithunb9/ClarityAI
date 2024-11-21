"use client";

import FileUpload from "../components/FileUpload";
import { Container, Box, Heading } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function UploadPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Container maxW="container.xl" py={10}>
        <Box>Loading...</Box>
      </Container>
    );
  }

  if (!session) {
    redirect("/");
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" mb={8}>
        <Heading>Upload Documents</Heading>
      </Box>
      <FileUpload />
    </Container>
  );
}