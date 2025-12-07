// Simple type definition for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const startListening = (
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError: (error: any) => void
) => {
  const windowObj = window as unknown as IWindow;
  const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (e) {
    onError(e);
    return null;
  }
};
