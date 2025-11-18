import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { FirebaseSecrets } from './firebase-secrets';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

enum UIMode {
  Default,
  Dictate,
  Voice,
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, HttpClientModule, CommonModule], // Removed HttpClientModule, added FormsModule
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly UIMode = UIMode; // Expose enum to template
  protected currentMode = signal(UIMode.Default);
  protected inputText = signal('');
  protected isVoiceModeEnabled = signal(false);
  protected chatMessages = signal<Array<{ type: 'user' | 'assistant', text: string }>>([]);
  protected isTyping = signal(false);
  protected isMicMuted = signal(false); // New signal for microphone mute state
  private recognition: any;
  protected readonly error = signal<unknown | undefined>(undefined);  
  protected readonly geminiKey = signal<string | undefined>(undefined);

  private secrets = inject(FirebaseSecrets);
  private http = inject(HttpClient); 

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event: any) => {
          let interim_transcript = '';
          let final_transcript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final_transcript += event.results[i][0].transcript;
            } else {
              interim_transcript += event.results[i][0].transcript;
            }
          }
          this.inputText.set(final_transcript + interim_transcript);
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
        };

        this.recognition.onend = () => {
          this.currentMode.set(UIMode.Default);
        };
      }
    }
  }

  startDictateMode() {
    if (this.recognition) {
      this.currentMode.set(UIMode.Dictate);
      this.recognition.start();
    }
  }

  acceptDictation() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.currentMode.set(UIMode.Default);
  }

  sendMessage() {
    if (this.inputText().trim()) {
      let prompt:string = this.inputText();
      this.chatMessages.update((messages: any) => [...messages, { type: 'user', text: prompt }]);
      this.isTyping.set(true);
      this.invokeLLM(prompt);
      this.isTyping.set(false);
      this.inputText.set('');
    }
  }

  cancelDictation() {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.inputText.set('');
    this.currentMode.set(UIMode.Default);
  }

  toggleVoiceMode() {
    this.isVoiceModeEnabled.update((value: any) => !value);
    if (this.isVoiceModeEnabled()) {
      this.currentMode.set(UIMode.Voice);
      this.simulateVoiceConversation();
    } else {
      this.currentMode.set(UIMode.Default);
      // Stop voice conversation simulation when voice mode is disabled
      // (The simulateVoiceConversation function needs to be updated to handle this)
    }
  }

  toggleMicMute() {
    this.isMicMuted.update((value: any) => !value);
  }

  cancelVoiceMode() {
    this.isVoiceModeEnabled.set(false);
    this.currentMode.set(UIMode.Default);
    this.isMicMuted.set(false); // Reset mute state when exiting voice mode
  }

  private simulateAssistantResponse() {
    this.isTyping.set(true);
    setTimeout(() => {
      this.chatMessages.update((messages: any) => [...messages, { type: 'assistant', text: 'This is a mocked assistant response.' }]);
      this.isTyping.set(false);
    }, 3000);
  }

  private simulateVoiceConversation() {
    // Removed simulated incoming messages functionality as requested.
    // This method will now only manage the voice mode state without adding chat messages.
  }
protected async invokeLLM (prompt: string)
{
    this.error.set(undefined);
    console.log('=== Test Button Clicked ===');
    
    console.log('prompt:', prompt);

    try {
      console.log('Calling Firebase invokeLLM function...');

      const response = await fetch(
        'https://us-central1-wpbest-website.cloudfunctions.net/invokeLLM',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: { text: prompt },
          }),
        }
      );

      console.log('HTTP Status:', response.status);

      const result = await response.json();
      console.log('LLM Raw Response:', result);

      // Final processed logging
      const output = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(result);

      this.chatMessages.update((messages: any) => [...messages, { type: 'assistant', text: output }]);

      console.log('LLM Output:', output);

    } catch (err) {
      console.error('invokeLLM ERROR:', err);
      this.error.set(err);
    } finally {
      console.log('=== Test Button Completed ===');
    }
}
protected async testCode() {
    const prompt = 'Hello Gemini Flash Lite 2.5. This is a test.';
    this.invokeLLM(prompt);
}

}
