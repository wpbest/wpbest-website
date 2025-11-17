

import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class FirebaseSecrets {
  private functions = inject(Functions);

  async getGeminiKey(): Promise<string> {
    const getGeminiKeyFn = httpsCallable(this.functions, 'getGeminiKey');
    const result = await getGeminiKeyFn();
    return (result.data as { key: string }).key;
  }
}