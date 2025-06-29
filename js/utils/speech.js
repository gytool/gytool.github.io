export class SpeechRecognitionManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResult = null;
        this.onError = null;
        this.onEnd = null;
        
        this.initSpeechRecognition();
    }
    
    initSpeechRecognition() {
        // Check for speech recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'cs-CZ'; // Czech language
        
        this.recognition.onstart = () => {
            console.log('Speech recognition started');
            this.isListening = true;
        };
        
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (this.onResult) {
                this.onResult(finalTranscript, interimTranscript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            
            if (this.onError) {
                this.onError(event.error);
            }
        };
        
        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            this.isListening = false;
            
            if (this.onEnd) {
                this.onEnd();
            }
        };
    }
    
    isSupported() {
        return this.recognition !== null;
    }
    
    start() {
        if (!this.recognition) {
            throw new Error('Speech recognition not supported');
        }
        
        if (this.isListening) {
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            throw error;
        }
    }
    
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    abort() {
        if (this.recognition && this.isListening) {
            this.recognition.abort();
        }
    }
}