import { Box, Button, useToast } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { FiMic, FiSquare } from "react-icons/fi";

const RecordButton: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const toast = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];

        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to transcribe audio');
          }

          const data = await response.json();
          console.log('Transcription:', data.text);
          toast({
            title: "Transcription complete",
            description: data.text,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Error",
            description: "Failed to transcribe audio",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Recording error:', err);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        colorScheme={isRecording ? "red" : "blue"}
        leftIcon={isRecording ? <FiSquare /> : <FiMic />}
        isLoading={false}
        loadingText="Processing..."   
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>
    </Box>
  );
};

export default RecordButton;    