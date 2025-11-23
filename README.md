# Funwattle AI-Powered Speech Therapy App

Funwattle is an AI-powered speech therapy application designed to help children improve their pronunciation and speech skills interactively. The app combines speech recognition, machine learning, and gamified exercises to deliver real-time feedback and progress tracking.

## Quick Start to Run Application

### 1. Clone the Repository on Your Local Machine
```
git clone https://github.com/unsw-cse-comp99-3900/capstone-project-25t3-3900-h09a-banana.git
cd capstone-project-25t3-3900-h09a-banana
```

### 2. Install Expo Go on Your Mobile Device
To run the frontend application, you need to install the Expo Go app on your mobile device. You can download it from:
- [iOS App Store](https://apps.apple.com/us/app/expo-go/id982107779)
- [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_AU&pli=1)


### 3. Set up Docker and Build Backend
Before continuing, make sure docker is installed and running on your system. You can download it from:
 - [Docker Get Started](https://www.docker.com/get-started)

### 4. Build and Start up the Application
To build and start up the application, run the following command from the root directory of the repository:
```
docker compose up --build
```

For the first time running the application, this command may take some time as it builds the docker images for both the frontend and backend services. Once complete, this starts the entire application (frontend and backend).

Since the frontend is run through Expo, you will see a QR code in the terminal once the application is ready to use. You can scan this QR code on your mobile device, which will open the Expo Go app and launch the application.

### 5. Stop the Application
To stop the application, press `CTRL + C` in the terminal where the application is running. You should see messages indicating that the docker containers are stopping.

Then, run the following command to ensure all containers are properly stopped and removed:
```
docker compose down
```

## Other Development Information

### Further Information
To find further information on the codebase, check out the `README.md` files located in:
- [frontend](./frontend/README.md)
- [backend](./backend/README.md)
- [swagger](./swagger/README.md)
- [test](./backend/controller/test/README.md)
- [.github](./.github/workflows/README.md)

