# Frontend

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Web Deployment

You can access the deployed web version of the frontend application at the following URL: [https://funwattle-web.onrender.com/](https://funwattle-web.onrender.com/)

## File Walkthrough

- [app/](./app)
  Contains all the core application route files and UI flows.
  - [/app/(parent-tabs)](./app/(parent-tabs))
   Contains the screens that appear in the navigation bar of the parent dashboard.
  - [/app/(therapist-tabs)](./app/(therapist-tabs))
  Contains the screens that appear in the navigation bar of the therapist dashboard.
  - [/app/(therapist-tabs)](./app/child-onboarding)
  Contains the screens that appear throughout a parent user's add child flow.
- [assets/images](./assets/images)
  Contains the static images and media used throughout app.
- [components/](./components)
  Contains the screens and reusable UI components used throughout app.
  - [components/home-screen](./components/home-screen)
  Contains the UI components featured on the home screen of parent and therapist dashboards.
  - [components/shared](./components/shared)
  Contains the UI components associated with the Learning Units Library feature common to parent and therapist dashboards via the `learning-units.tsx` file in their respective tab folders.
  - [components/ui](./components/ui)
  Contains smaller UI components that are frequently repeated, such as a variety of display card designs.
  - [components/util](./components/util)
  Contains helper function files.
- [hooks/](./hooks)
  Custom React hooks for shared logic.
- [Dockerfile](./Dockerfile)
  Configuration for containerising and deploying the frontend.

## Tech Stack

- **React Native** with [**Expo**](https://docs.expo.dev/)
- **Typescript**
- [**React Native Paper**](https://reactnativepaper.com/) UI components
- **Expo Router** for [file-based routing](https://docs.expo.dev/router/introduction)
- **Fetch API** for HTTP requests

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.


