import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ACCURA_AI_PROMPT } from './accura-ai-prompt';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);

  invokeLLM(prompt: string): Observable<string> {
    const url = 'https://us-central1-wpbest-website.cloudfunctions.net/invokeLLM';
    const body = {
      data: {
        text: prompt,
        systemInstruction: ACCURA_AI_PROMPT,
      },
    };

    return this.http.post<any>(url, body).pipe(
      map((result) => {
        return (
          result?.result?.candidates?.[0]?.content?.parts?.[0]?.text ??
          result?.candidates?.[0]?.content?.parts?.[0]?.text ??
          JSON.stringify(result)
        );
      })
    );
  }
}