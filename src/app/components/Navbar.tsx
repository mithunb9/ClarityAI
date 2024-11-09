import { Box, Flex, Text, Container } from "@chakra-ui/react";
import AuthButton from "./AuthButton";

function Navbar() {
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
          >
            ClarityAI
          </Text>
          <AuthButton />
        </Flex>
      </Container>
    </Box>
  );
}

export default Navbar;