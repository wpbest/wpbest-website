import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'wpbest-website',
        appId: '1:336907459040:web:74577dfab16ee44a007385',
        storageBucket: 'wpbest-website.firebasestorage.app',
        apiKey: 'AIzaSyAn4G3YHiqZNM7KxONT-oirFqyQWtjaF5I',
        authDomain: 'wpbest-website.firebaseapp.com',
        messagingSenderId: '336907459040'
      })
    ),
    provideAuth(() => getAuth()),
    provideFunctions(() => getFunctions()),
  ],
};
