import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
import { decode } from 'he';
import removeMd from 'remove-markdown';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AiService } from './ai.service';
import { FirebaseSecrets } from './firebase-secrets';
import { MarkdownPipe } from './markdown.pipe';

enum UIMode {
  Default,
  Dictate,
  Voice,
}

export function cleanTextForTTS(input: string): string {
  if (!input) return '';

  let s = removeMd(input); // Remove bold/italic/markdown
  s = decode(s); // Decode HTML entities
  s = s.replace(/\*/g, ''); // Remove any remaining literal asterisks
  return s.trim();
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, MarkdownPipe, MatButtonModule, MatIconModule], // Removed HttpClientModule, added FormsModule
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly UIMode = UIMode; // Expose enum to template
  protected currentMode = signal(UIMode.Default);
  protected inputText = signal('');
  protected isVoiceModeEnabled = signal(false);
  protected chatMessages = signal<Array<{ type: 'user' | 'assistant'; text: string }>>([]);
  protected isTyping = signal(false);
  protected isMicMuted = signal(false); // New signal for microphone mute state
  protected isAudioPlaying = signal(false); // Signal for audio playback state
  protected isAudioPaused = signal(false); // Signal for audio paused state
  private currentAudio: HTMLAudioElement | null = null; // Reference to current audio
  private recognition: any;
  protected readonly error = signal<unknown | undefined>(undefined);
  protected readonly geminiKey = signal<string | undefined>(undefined);
  private secrets = inject(FirebaseSecrets);
  private http = inject(HttpClient);
  private aiService = inject(AiService);
  
  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
          if (this.currentMode() === UIMode.Dictate) {
            this.inputText.set(final_transcript + interim_transcript);
          } else if (this.currentMode() === UIMode.Voice && final_transcript.trim().length > 0) {
            this.chatMessages.update((messages: any) => [
              ...messages,
              { type: 'user', text: final_transcript },
            ]);
            requestAnimationFrame(() => {
              const chatArea = document.querySelector('.chat-area');
              if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
            });
            this.invokeLLM(final_transcript);
            this.inputText.set('');
          }
        };
        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
        };
        this.recognition.onend = () => {
          // Only set to Default if voice mode is not enabled, otherwise, recognition might restart
          if (!this.isVoiceModeEnabled()) {
            this.currentMode.set(UIMode.Default);
          } else {
            // If in voice mode and recognition ends, restart it automatically
            this.recognition.start();
          }
        };
      }
    }
  }

  playSpeech(text: string): void {
    // Stop any currently playing audio
    this.stopAudio();

    this.secrets.getSpeech(text).subscribe((data) => {
      const blob = new Blob([data], { type: 'audio/mp3' });
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.isAudioPlaying.set(true);
        this.isAudioPaused.set(false);
      };
      audio.onpause = () => {
        this.isAudioPaused.set(true);
      };
      audio.onended = () => {
        this.isAudioPlaying.set(false);
        this.isAudioPaused.set(false);
        this.currentAudio = null;
      };
      audio.onerror = () => {
        this.isAudioPlaying.set(false);
        this.isAudioPaused.set(false);
        this.currentAudio = null;
      };

      audio.play();
    });
  }

  toggleAudioPlayback(): void {
    if (this.currentAudio) {
      if (this.isAudioPaused()) {
        this.currentAudio.play();
      } else {
        this.currentAudio.pause();
      }
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isAudioPlaying.set(false);
      this.isAudioPaused.set(false);
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
      let prompt: string = this.inputText();
      this.chatMessages.update((messages: any) => [...messages, { type: 'user', text: prompt }]);
      this.invokeLLM(prompt);
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
      this.chatMessages.set([]); // Clear chat messages when entering voice mode
      this.currentMode.set(UIMode.Voice);
      if (this.recognition) {
        this.recognition.start();
      }
    } else {
      this.chatMessages.set([]); // Clear chat messages when exiting voice mode
      this.currentMode.set(UIMode.Default);
      if (this.recognition) {
        this.recognition.stop();
      }
    }
  }

  toggleMicMute() {
    this.isMicMuted.update((value: any) => !value);
    // This function now only manages the mute state.
  }

  cancelVoiceMode() {
    this.isVoiceModeEnabled.set(false);
    this.currentMode.set(UIMode.Default);
    this.isMicMuted.set(false); // Reset mute state when exiting voice mode
    this.chatMessages.set([]); // Clear chat messages when cancelling voice mode
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private destroyRef = inject(DestroyRef);

  protected invokeLLM(prompt: string) {
    this.isTyping.set(true);
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
            data: {
              text: prompt,
              systemInstruction: ACCURA_AI_PROMPT,
            },
          }),
        }
      );
      console.log('HTTP Status:', response.status);
      const result = await response.json();
      console.log('LLM Raw Response:', result);
      const output = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(result);
      this.chatMessages.update((messages: any) => [
        ...messages,
        { type: 'assistant', text: output },
      ]);
      requestAnimationFrame(() => {
        const chatArea = document.querySelector('.chat-area');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
      });
      let cleanedText = cleanTextForTTS(output);
      this.playSpeech(cleanedText);
      this.isTyping.set(false);
      console.log('LLM Output:', output);
      this.isTyping.set(false);
    } catch (err) {
      this.isTyping.set(false);
      console.error('invokeLLM ERROR:', err);
      this.error.set(err);
    } finally {
      this.isTyping.set(false);
      console.log('=== Test Button Completed ===');
    }
  }

  protected async testCode() {
    const textToSpeak = 'Hello, this is a test of the Google Cloud text to speech functionality.';
    this.playSpeech(textToSpeak);
  }
}
