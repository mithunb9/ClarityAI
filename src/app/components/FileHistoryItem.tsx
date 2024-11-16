import { Text, Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface FileHistoryItemProps {
  id: string;
  name: string;
  uploadedAt?: string;
}

const FileHistoryItem: React.FC<FileHistoryItemProps> = ({ id, name, uploadedAt }) => {
  const router = useRouter();

  return (
    <Button
      p={4}
      width="100%"
      height="auto"
      display="block"
      textAlign="left"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      _hover={{ boxShadow: "md" }}
      onClick={() => router.push(`/results/${id}`)}
      variant="outline"
    >
      <Text fontWeight="bold">{name}</Text>
      {uploadedAt && (
        <Text fontSize="sm" color="gray.500">
          Uploaded: {new Date(uploadedAt).toLocaleDateString()}
        </Text>
      )}
    </Button>
  );
};

export default FileHistoryItem;