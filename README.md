# Funwattle AI-Powered Speech Therapy App

Funwattle is an AI-powered speech therapy application designed to help children improve their pronunciation and speech skills interactively. The app combines speech recognition, machine learning, and gamified exercises to deliver real-time feedback and progress tracking.

## Quick Start to Run Application

### 1. Clone the Repository
```
git clone https://github.com/unsw-cse-comp99-3900/capstone-project-25t3-3900-h09a-banana.git
cd capstone-project-25t3-3900-h09a-banana
```

### 2. Set up Docker and Build Backend
Before continuing, make sure docker and docker compose are installed and running on your system.
 - To install docker: https://www.docker.com/get-started

Then, build the backend containers from the project root directory:
```
docker compose build backend
```

### 3. Install Front-end Dependencies
```
cd frontend
npm install
```

### 4. Start the Backend
First, we will start up the backend from the project root directory:
```
docker compose up -d
```
This starts the backend and it will keep running in the background. To stop these containers when you're finished, run:
```
docker compose down
```

### 5. Start the Frontend
Open a new terminal window and run:
```
cd frontend
npx expo start
```
This starts the Expo development server. You can scan the QR code with the Expo Go app on your phone to launch the app.

