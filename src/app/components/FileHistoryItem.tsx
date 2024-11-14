import { Box, Text } from "@chakra-ui/react";

interface FileHistoryItemProps {
  name: string;
  type: string;
  uploadedAt?: string;
}

const FileHistoryItem: React.FC<FileHistoryItemProps> = ({ name, type, uploadedAt }) => {
  return (
    <Box 
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      _hover={{ boxShadow: "md" }}
    >
      <Text fontWeight="bold">{name}</Text>
      <Text fontSize="sm" color="gray.500">Type: {type}</Text>
      {uploadedAt && (
        <Text fontSize="sm" color="gray.500">
          Uploaded: {new Date(uploadedAt).toLocaleDateString()}
        </Text>
      )}
    </Box>
  );
};

export default FileHistoryItem; 