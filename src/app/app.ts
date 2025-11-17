import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FirebaseSecrets } from './firebase-secrets';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('wpbest-website');
  protected readonly error = signal<unknown | undefined>(undefined);
  private firebaSesecrets = inject(FirebaseSecrets);
  
async onTestButtonClick() {
  this.error.set(undefined);

  console.log("=== Test Button Clicked ===");
  const testPrompt = "Hello Gemini Flash Lite 2.5. This is a test.";
  console.log("Test Prompt:", testPrompt);

  try {
    console.log("Calling Firebase invokeLLM function...");

    const response = await fetch(
      "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/invokeLLM",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { text: testPrompt }
        })
      }
    );

    console.log("HTTP Status:", response.status);

    const result = await response.json();
    console.log("LLM Raw Response:", result);

    // Final processed logging
    const output =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ??
      JSON.stringify(result);

    console.log("LLM Output:", output);
  } catch (err) {
    console.error("invokeLLM ERROR:", err);
    this.error.set(err);
  } finally {
    console.log("=== Test Button Completed ===");
  }
}

}

