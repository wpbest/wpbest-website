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
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

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
  private shouldRestartRecognition = true; // Flag to control auto-restart of recognition
  protected readonly error = signal<unknown | undefined>(undefined);
  protected readonly geminiKey = signal<string | undefined>(undefined);
  private secrets = inject(FirebaseSecrets);
  private http = inject(HttpClient);
  private aiService = inject(AiService);

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
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
          // Reset to Default when voice mode is disabled
          if (!this.isVoiceModeEnabled()) {
            this.currentMode.set(UIMode.Default);
          } else if (this.shouldRestartRecognition && !this.isMicMuted()) {
            // Restart only when auto‑restart allowed and mic not muted
            this.recognition.start();
          }
        };
      }
    }
  }

  playSpeech(text: string): void {
    // Ensure any previous audio is stopped
    this.stopAudio();

    this.secrets.getSpeech(text).subscribe((data) => {
      const blob = new Blob([data], { type: 'audio/mp3' });
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      this.currentAudio = audio;

      const resumeRecognition = () => {
        if (this.currentMode() === UIMode.Voice && this.recognition && !this.isMicMuted()) {
          this.recognition.start();
          this.shouldRestartRecognition = true;
        }
      };

      audio.onplay = () => {
        this.isAudioPlaying.set(true);
        this.isAudioPaused.set(false);
        // Mute mic while assistant speaks
        if (this.currentMode() === UIMode.Voice && this.recognition) {
          this.recognition.stop();
          this.shouldRestartRecognition = false;
        }
      };
      audio.onpause = () => this.isAudioPaused.set(true);
      audio.onended = () => {
        this.isAudioPlaying.set(false);
        this.isAudioPaused.set(false);
        this.currentAudio = null;
        resumeRecognition();
      };
      audio.onerror = () => {
        this.isAudioPlaying.set(false);
        this.isAudioPaused.set(false);
        this.currentAudio = null;
        resumeRecognition();
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
      // Restart speech recognition in voice mode after stopping audio
      if (this.currentMode() === UIMode.Voice && this.recognition && this.isVoiceModeEnabled()) {
        this.shouldRestartRecognition = true; // Re-enable auto-restart
        this.recognition.start();
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    this.isTyping.set(true);
    this.extractTextFromFile(file)
      .then(text => {
        const prompt = "Summarize and explain this document:\n" + text;
        this.chatMessages.update((messages: any) => [...messages, { type: 'user', text: `[Uploaded File: ${file.name}]` }]);
        this.invokeLLM(prompt);
      })
      .catch(error => {
        console.error('Error extracting text:', error);
        this.error.set(error);
        this.isTyping.set(false);
      });
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

  toggleMicMute(): void {
    const nowMuted = !this.isMicMuted();
    this.isMicMuted.set(nowMuted);
    if (this.currentMode() === UIMode.Voice && this.recognition) {
      if (nowMuted) {
        this.recognition.stop();
        this.shouldRestartRecognition = false;
      } else {
        this.recognition.start();
        this.shouldRestartRecognition = true;
      }
    }
  }

  cancelVoiceMode() {
    this.isVoiceModeEnabled.set(false);
    this.currentMode.set(UIMode.Default);
    this.isMicMuted.set(false); // Reset mute state when exiting voice mode
    this.chatMessages.set([]); // Clear chat messages when cancelling voice mode
    if (this.recognition) {
      this.recognition.stop();
    }
    this.stopAudio();
  }

  private destroyRef = inject(DestroyRef);

  private async extractTextFromFile(file: File): Promise<string> {
    switch (file.type) {
      case 'text/plain':
        return this.readTextFile(file);
      case 'application/pdf':
        return this.readPdfFile(file);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.readDocxFile(file);
      default:
        this.isTyping.set(false);
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  private readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async readPdfFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => (item as any).str).join(' ');
    }
    return text;
  }

  private async readDocxFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  protected invokeLLM(prompt: string) {
    this.isTyping.set(true);
    this.error.set(undefined);
    console.log('=== Test Button Clicked ===');
    console.log('prompt:', prompt);

    console.log('Calling AiService invokeLLM function...');
    this.aiService
      .invokeLLM(prompt)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (output) => {
          this.chatMessages.update((messages: any) => [
            ...messages,
            { type: 'assistant', text: output },
          ]);
          let cleanedText = cleanTextForTTS(output);
          this.playSpeech(cleanedText);
          this.isTyping.set(false);
          console.log('LLM Output:', output);
        },
        error: (err) => {
          this.isTyping.set(false);
          console.error('invokeLLM ERROR:', err);
          this.error.set(err);
          console.log('=== Test Button Completed (Error) ===');
        },
        complete: () => {
          console.log('=== Test Button Completed ===');
        },
      });
  }

  protected async testCode() {
    const textToSpeak = 'Hello, this is a test of the Google Cloud text to speech functionality.';
    this.playSpeech(textToSpeak);
  }
}
