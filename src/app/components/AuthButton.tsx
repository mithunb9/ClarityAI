"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { 
  Button, 
  Text, 
  Flex, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Avatar,
  AvatarProps
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";

const AuthButton: React.FC = () => {
  const { data: session } = useSession();

  const avatarProps: AvatarProps = {
    size: "sm",
    name: session?.user?.name || undefined,
    src: session?.user?.image || undefined,
    referrerPolicy: "no-referrer"
  };

  if (session) {
    return (
      <Menu>
        <MenuButton
          as={Button}
          variant="ghost"
          rightIcon={<FiChevronDown />}
          _hover={{ bg: 'blue.600' }}
        >
          <Flex align="center" gap={2}>
            <Avatar {...avatarProps} />
            <Text color="white">{session.user?.name}</Text>
          </Flex>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => signOut()}>Sign out</MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Button
      colorScheme="whiteAlpha"
      onClick={() => signIn("google")}
      size="md"
      fontWeight="medium"
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
  );
};

export default AuthButton;
