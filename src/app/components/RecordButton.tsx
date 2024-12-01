import { FC, useState, useRef } from "react";
import { Button, useToast, Spinner } from "@chakra-ui/react";
import { FiMic, FiMicOff } from "react-icons/fi";

interface RecordButtonProps {
    onTranscriptionComplete: (transcription: string) => void;
}

const RecordButton: FC<RecordButtonProps> = ({ onTranscriptionComplete }) => {
    const [recording, setRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recorderTimeout, setRecorderTimeout] = useState<NodeJS.Timeout | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const toast = useToast();

    const startRecording = async () => {
        if (!navigator.mediaDevices) {
            toast({
                title: "Error",
                description: "Your browser does not support audio recording.",
                status: "error",
                duration: 3000,
            });
            return;
        }

        try {
            setRecording(true);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

            const audioChunks: Blob[] = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                const formData = new FormData();
                formData.append("audio", audioBlob);

                try {
                    const response = await fetch("http://127.0.0.1:5000/transcribe", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        toast({
                            title: "Error",
                            description: `Transcription failed: ${response.statusText}`,
                            status: "error",
                            duration: 3000,
                        });
                        return;
                    }

                    const data = await response.json();

                    if (data.text) {
                        onTranscriptionComplete(data.text);
                        toast({
                            title: "Success",
                            description: "Transcription completed successfully!",
                            status: "success",
                            duration: 3000,
                        });
                    } else if (data.error) {
                        toast({
                            title: "Error",
                            description: `Backend Error: ${data.error}`,
                            status: "error",
                            duration: 3000,
                        });
                    }
                } catch (error) {
                    toast({
                        title: "Error",
                        description: "Failed to reach the server for transcription.",
                        status: "error",
                        duration: 3000,
                    });
                } finally {
                    setIsProcessing(false);
                    setRecording(false);
                }
            };

            recorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setRecording(true);
            const timeout = setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                }
            }, 30000);

            setRecorderTimeout(timeout);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to access microphone.",
                status: "error",
                duration: 3000,
            });
            //setRecording(false);
        }
    };

    const stopRecording = () => {
        if (recorderRef.current && recorderRef.current.state === "recording") {
            setIsProcessing(true);
            recorderRef.current.stop();
        }
        setRecording(false);

        if (recorderTimeout) {
            clearTimeout(recorderTimeout);
            setRecorderTimeout(null);
        }
    };

    const handleRecording = () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <Button
            leftIcon={isProcessing ? <Spinner size="sm" /> : recording ? <FiMicOff /> : <FiMic />}
            onClick={handleRecording}
            colorScheme={recording ? "red" : "blue"}
            isDisabled={isProcessing}
        >
            {isProcessing ? "Processing..." : recording ? "Stop Recording" : "Record Answer"}
        </Button>
    );
};

export default RecordButton;