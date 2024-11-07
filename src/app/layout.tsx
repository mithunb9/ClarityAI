import React from "react";
import Navbar from "./components/Navbar";
import { ChakraProvider, Box } from "@chakra-ui/react";
import './globals.css';

export const metadata = {
  title: "clarity",
  description: "Learn content in a new way",
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <Navbar />
          <Box as="main" p={8} maxW="1200px" mx="auto">
            {children}
          </Box>
        </ChakraProvider>
      </body>
    </html>
  );
};

export default RootLayout;