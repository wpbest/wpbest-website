# wpbest-website
wpbest-website is a repository that contains the source code for http://wpbest.org, the official website for William Paul Best. The site showcases his 40+ years of experience as a Computer Scientist and Mathematician in Artificial Intelligence and promotes his YouTube channel 'wpbest'.
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

# Developemnt Environment
GitHub: wpbest      Gmail:wpbest@gmail.com
GitHub: senshi111   GMail:banenicovic@gmail.com

Restore Git Repository to a specified commit
```bash
git reset --hard abc1234
git push origin HEAD --force
```

## install Node JS
```bash
nvm list
nvm install 22.21.1
nvm use 22.21.1
```

## Install Angular
```bash
npm install -g @angular/cli
```

## Install Firebase Tools and CLI
```bash
npm i -g firebase-tools
```

## Install Google Gemini CLI
```bash
npm install -g @google/gemini-cli
```

Firebase MCP Server
https://firebase.blog/posts/2025/10/firebase-mcp-server-ga

gemini extensions install https://github.com/gemini-cli-extensions/firebase

```bash
 ng new wpbest-website --routing --style scss --skip-install --skip-git --strict --skip-tests
 ```
✔ Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? No  
✔ Do you want to create a 'zoneless' application without zone.js? Yes  
✔ Which AI tools do you want to configure with Angular best practices?  
https://angular.dev/ai/develop-with-ai  
Gemini         [ https://ai.google.dev/gemini-api/docs           ]
CREATE angular.json (3131 bytes)  
CREATE package.json (1113 bytes)  
CREATE README.md (1536 bytes)  
CREATE tsconfig.json (973 bytes)  
CREATE .editorconfig (331 bytes)  
CREATE .gitignore (647 bytes)  
CREATE tsconfig.app.json (444 bytes)  
CREATE tsconfig.spec.json (449 bytes)  
CREATE .vscode/extensions.json (134 bytes)  
CREATE .vscode/launch.json (490 bytes)  
CREATE .vscode/tasks.json (980 bytes)  
CREATE src/main.ts (228 bytes)  
CREATE src/index.html (312 bytes)  
CREATE src/styles.scss (81 bytes)  
CREATE src/app/app.ts (309 bytes)  
CREATE src/app/app.scss (0 bytes)  
CREATE src/app/app.html (20464 bytes)  
CREATE src/app/app.config.ts (395 bytes)  
CREATE src/app/app.routes.ts (80 bytes)  
CREATE public/favicon.ico (15086 bytes)  
CREATE .gemini/GEMINI.md (1983 bytes)  

```bash
ng add @angular/pwa
```
✔ Determining Package Manager
  › Using package manager: npm
✔ Searching for compatible package version
  › Found compatible package version: @angular/pwa@20.3.10.
✔ Loading package information from registry
✔ Confirming installation
✔ Installing package in temporary location
CREATE ngsw-config.json (669 bytes)
CREATE public/manifest.webmanifest (1292 bytes)
CREATE public/icons/icon-128x128.png (2875 bytes)
CREATE public/icons/icon-144x144.png (3077 bytes)
CREATE public/icons/icon-152x152.png (3293 bytes)
CREATE public/icons/icon-192x192.png (4306 bytes)
CREATE public/icons/icon-384x384.png (11028 bytes)
CREATE public/icons/icon-512x512.png (16332 bytes)
CREATE public/icons/icon-72x72.png (1995 bytes)
CREATE public/icons/icon-96x96.png (2404 bytes)
UPDATE angular.json (3225 bytes)
UPDATE package.json (1187 bytes)
UPDATE src/app/app.config.ts (1312 bytes)
UPDATE src/index.html (448 bytes)
✔ Packages installed successfully.

## Add material design
```bash
ng add @angular/material
```
✔ Determining Package Manager
  › Using package manager: npm
✔ Searching for compatible package version
  › Found compatible package version: @angular/material@20.2.13.
✔ Loading package information from registry
✔ Confirming installation
✔ Installing package
✔ Select a pair of starter prebuilt color palettes for your Angular Material theme Azure/Blue         [Preview:
https://material.angular.dev?theme=azure-blue]
UPDATE package.json (1256 bytes)
✔ Packages installed successfully.
UPDATE src/styles.scss (1393 bytes)
UPDATE src/index.html (648 bytes)

```bash
ng add @angular/fire
```
✔ Determining Package Manager
  › Using package manager: npm
✔ Searching for compatible package version
  › Found compatible package version: @angular/fire@20.0.1.
✔ Loading package information from registry
✔ Confirming installation
✔ Installing package
UPDATE package.json (1145 bytes)
✔ Packages installed successfully.
? What features would you like to setup? Authentication, Cloud Functions (callable)
Using firebase-tools version 14.25.0
? Which Firebase account would you like to use? wpbest@gmail.com
✔ Preparing the list of your Firebase projects
? Please select a project: wpbest-website
✔ Preparing the list of your Firebase WEB apps
? Please select an app: wpbest-website
✔ Downloading configuration data of your Firebase WEB app
UPDATE .gitignore (701 bytes)
UPDATE src/app/app.config.ts (1028 bytes)

+  Created service account github-action-1098403111 with Firebase Hosting admin permissions.
+  Uploaded service account JSON to GitHub as secret FIREBASE_SERVICE_ACCOUNT_WPBEST_WEBSITE.
i  You can manage your secrets at https://github.com/wpbest/wpbest-website/settings/secrets.

firebase init

     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  C:\Users\willi\OneDrive\Documents\GitHub\wpbest-website

Before we get started, keep in mind:

  * You are initializing within an existing Firebase project directory

✔ Are you ready to proceed? Yes
✔ Which Firebase features do you want to set up for this directory? Press Space to select features, then Enter to
confirm your choices. Functions: Configure a Cloud Functions directory and its files, Hosting: Set up deployments for
static web apps, Emulators: Set up local emulators for Firebase products

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add,

✔ Please select an option: Use an existing project
✔ Select a default Firebase project for this directory: wpbest-website (wpbest-website)

=== Functions Setup
Let's create a new codebase for your functions.
A directory corresponding to the codebase will be created in your project
with sample code pre-configured.

See https://firebase.google.com/docs/functions/organize-functions for
more information on organizing your functions using codebases.

Functions can be deployed with firebase deploy.

✔ What language would you like to use to write Cloud Functions? TypeScript
✔ Do you want to use ESLint to catch probable bugs and enforce style? No
+  Wrote functions/package.json
+  Wrote functions/tsconfig.json
+  Wrote functions/src/index.ts
+  Wrote functions/.gitignore
✔ Do you want to install dependencies with npm now? Yes
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

added 523 packages, and audited 524 packages in 13s

67 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

✔ What do you want to use as your public directory? dist/wpbest-website/browser
✔ Configure as a single-page app (rewrite all urls to /index.html)? Yes
✔ Set up automatic builds and deploys with GitHub? Yes

i  Detected a .git folder at C:\Users\willi\OneDrive\Documents\GitHub\wpbest-website
i  Authorizing with GitHub to upload your service account to a GitHub repository's secrets store.

Visit this URL on this device to log in:
https://github.com/login/oauth/authorize?client_id=89cf50f02ac6aaed3484&state=775518624&redirect_uri=http%3A%2F%2Flocalhost%3A9005&scope=read%3Auser%20repo%20public_repo

Waiting for authentication...

+  Success! Logged into GitHub as wpbest

✔ For which GitHub repository would you like to set up a GitHub workflow? (format: user/repository)
wpbest/wpbest-website

+  Created service account github-action-1098403111 with Firebase Hosting admin permissions.
+  Uploaded service account JSON to GitHub as secret FIREBASE_SERVICE_ACCOUNT_WPBEST_WEBSITE.
i  You can manage your secrets at https://github.com/wpbest/wpbest-website/settings/secrets.

✔ Set up the workflow to run a build script before every deploy? Yes
✔ What script should be run before every deploy? npm ci && npm run build

+  Created workflow file C:\Users\willi\OneDrive\Documents\GitHub\wpbest-website\.github/workflows/firebase-hosting-pull-request.yml
✔ Set up automatic deployment to your site's live channel when a PR is merged? Yes
✔ What is the name of the GitHub branch associated with your site's live channel? main

+  Created workflow file C:\Users\willi\OneDrive\Documents\GitHub\wpbest-website\.github/workflows/firebase-hosting-merge.yml

i  Action required: Visit this URL to revoke authorization for the Firebase CLI GitHub OAuth App:
https://github.com/settings/connections/applications/89cf50f02ac6aaed3484
i  Action required: Push any new workflow file(s) to your repo
✔ File dist/wpbest-website/browser/index.html already exists. Overwrite? Yes
+  Wrote dist/wpbest-website/browser/index.html

=== Emulators Setup
✔ Which Firebase emulators do you want to set up? Press Space to select emulators, then Enter to confirm your choices.
Authentication Emulator, Functions Emulator, Hosting Emulator
✔ Which port do you want to use for the auth emulator? 9099
✔ Which port do you want to use for the functions emulator? 5001
✔ Which port do you want to use for the hosting emulator? 5000
✔ Would you like to enable the Emulator UI? Yes
✔ Which port do you want to use for the Emulator UI (leave empty to use any available port)?
✔ Would you like to download the emulators now? Yes

+  Wrote configuration info to firebase.json
+  Wrote project information to .firebaserc

+  Firebase initialization complete!

## Import Projects
https://aistudio.google.com/app/projects

https://console.cloud.google.com/vertex-ai/studio/settings/api-keys?project=wpbest-website

## Create Gemini API Key
https://aistudio.google.com/app/api-keys

## Create a Firebase Functions Secretes (Sample API Key)
```bash
echo "AIzaSyDNOwL8XJPuqtJS6Gj1h_Bs-RgeUUaXkH4" | firebase functions:secrets:set GEMINI_API_KEY --data-file=- --project wpbest-website
```

```bash
npm install --save firebase-functions@latest
```
```bash
npm install --save firebase-admin@latest
```
## Make sure you change your product id for your Firebase Function

https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/invokeLLM

to

https://us-central1-wpbest-website.cloudfunctions.net/invokeLLM


Build the firebase functions
```bash
cd functions
npm install
npm run build   
```

```bash
npm run build --prefix functions
```

# Deploy Firebase Fuctions
firebase deploy --only functions

## Development server

To start a local development server, run:

```bash
ng serve -o
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm install
```

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.



## Install Tailwind CSS
Install @tailwindcss/postcss and its peer dependencies via npm.
[Documentation](https://tailwindcss.com/docs/installation/framework-guides/angular)

```bash
npm install tailwindcss @tailwindcss/postcss postcss --force
```

Configure PostCSS Plugins
Create a .postcssrc.json file in the root of your project and add the @tailwindcss/postcss plugin to your PostCSS configuration.

```bash
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Import Tailwind CSS
Add an @import to ./src/styles.css that imports Tailwind CSS.

```bash
@use 'tailwindcss' as *;
```

