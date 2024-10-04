import pyttsx3
import speech_recognition as sr

def text_to_speech(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

def speech_to_text():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Speak into ur mic:")
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio)
        print("Speech to text: " + text)
        return text
    except sr.UnknownValueError:
        print("Sorry, I did not understand what you said.")
    except sr.RequestError:
        print("Error with the speech recognition service.")

if __name__ == "__main__":
    spoken_text = speech_to_text()
    if spoken_text:
        text_to_speech(spoken_text)