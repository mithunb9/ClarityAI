import { Box, Flex, Text } from "@chakra-ui/react";

function Navbar() {
  return (
    <Box bg="blue.500" px={4}>
      <Flex h={16} alignItems="center" justifyContent="start">
        <Text fontSize="lg" fontWeight="bold" color="white">ClarityAI</Text>
      </Flex>
    </Box>
  );
}

export default Navbar;