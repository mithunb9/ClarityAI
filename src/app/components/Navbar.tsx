"use client";

import { Box, Flex, Text, Container, Button, HStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import { useSession } from "next-auth/react";

function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Box bg="blue.500" py={2}>
      <Container maxW="container.xl">
        <Flex 
          h={16} 
          alignItems="center" 
          justifyContent="space-between"
        >
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            color="white"
            letterSpacing="tight"
            cursor="pointer"
            onClick={() => router.push("/")}
          >
            ClarityAI
          </Text>
          
          <HStack spacing={4}>
            {session && (
              <>
                <Button
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'blue.600' }}
                  onClick={() => router.push("/upload")}
                >
                  Upload Files
                </Button>
                <Button
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'blue.600' }}
                  onClick={() => router.push("/quizzes")}
                >
                  My Quizzes
                </Button>
              </>
            )}
            <AuthButton />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navbar;