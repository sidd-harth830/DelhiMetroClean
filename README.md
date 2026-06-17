# 🚇 Delhi Metro Clean App

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?style=for-the-badge&logo=appwrite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

Welcome to the **Delhi Metro App**, a comprehensive, cross-platform mobile application designed to simplify your daily commute in Delhi, India. Find the quickest routes, calculate accurate fares, explore station amenities, and navigate the entire metro network with ease.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [📥 Download & Access](#-download--access)
- [🏗 Architecture Diagram](#-architecture-diagram)
- [📱 Screenshots](#-screenshots)
- [🛠 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚙️ Local Installation & Setup](#️-local-installation--setup)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features

- **🗺️ Journey Planner**: Find the most optimized routes between any two stations with details on interchanges and duration.
- **💰 Fare Calculator**: Get exact fare details for standard journeys.
- **📍 Station Information**: View comprehensive details including First/Last train timings, parking availability, and exit gates.
- **🚉 Interactive Metro Map**: Zoomable, high-resolution visual map of the entire Delhi Metro network.
- **🚦 Live Status & Alerts**: Real-time line status and service updates.
- **🔒 User Authentication**: Create an account via Appwrite to save favorite stations and recent routes.
- **🌑 Dark/Light Mode**: Full theming support tailored to user preference.

---

## 📥 Download & Access

You can download and experience the app through various channels. Ensure you click the links below to access the installation files directly:

### 🍏 iOS
1. Download **Expo Go** from the App Store.
2. Scan the project QR Code from your Expo Dashboard.

### 🤖 Android
- **APK Download**: [📥 Download Latest APK Release](#) *(Check the GitHub Releases section for the compiled .apk file)*
- **Expo Go**: Scan the QR code using the Expo Go app.

### 🌍 Web Version
- Access the web build directly here: [🌐 Delhi Metro Web App](#)

> **Note**: For Over-The-Air (OTA) updates, this project uses Expo Updates linked to: `https://u.expo.dev/d5a9f98e-de44-445e-a448-a26619eb91e6`

---

## 🏗 Architecture Diagram

Below is the high-level architecture diagram representing the data flow and component structure of the Delhi Metro App.

```text
                          +-------------------------+
                          |   🚇 Delhi Metro App    |
                          +------------+------------+
                                       |
          +----------------------------+-----------------------------+
          |                            |                             |
 +--------v--------+          +--------v--------+           +--------v--------+
 |    UI Layer     |          |  State & Data   |           |    Services     |
 | - Navigation    |          | - React Hooks   |           | - API Layer     |
 | - Screens       |          | - React Query   |           | - DMRC Services |
 | - Components    |          |                 |           | - Auth Service  |
 +--------+--------+          +--------+--------+           +--------+--------+
          |                            |                             |
          +----------------------------+-----------------------------+
                                       |
          +----------------------------+-----------------------------+
          |                            |                             |
 +--------v--------+          +--------v--------+           +--------v--------+
 |  Async Storage  |          |  Expo SQLite    |           | Appwrite Backend|
 |  (Local Config) |          | (Offline Data)  |           | (Auth & Cloud)  |
 +-----------------+          +-----------------+           +-----------------+
```

---

## 📱 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/250x500?text=Home+Screen" width="22%" />
  <img src="https://via.placeholder.com/250x500?text=Route+Results" width="22%" />
  <img src="https://via.placeholder.com/250x500?text=Station+Details" width="22%" />
  <img src="https://via.placeholder.com/250x500?text=Metro+Map" width="22%" />
</div>

---

## 🛠 Tech Stack

The application is built using modern, scalable technologies:

### **Frontend:**
- **[React Native](https://reactnative.dev/)**: Framework for building native apps using React.
- **[Expo](https://expo.dev/)**: Platform for making universal native apps for Android, iOS, and the web.
- **[React Navigation](https://reactnavigation.org/)**: Routing and navigation for Expo and React Native apps.
- **[React Native Paper](https://callstack.github.io/react-native-paper/)**: Material Design guidelines components.

### **Data & State Management:**
- **[TanStack Query (React Query)](https://tanstack.com/query/latest)**: Powerful asynchronous state management.
- **[Async Storage](https://react-native-async-storage.github.io/async-storage/)**: Unencrypted, asynchronous, persistent, key-value storage system.
- **[Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)**: Provides access to a database that can be queried through SQLite.

### **Backend & Services:**
- **[Appwrite](https://appwrite.io/)**: Open-source backend-as-a-service providing Authentication and Databases.

---

## 📂 Project Structure

A quick look at how the files and directories are organized in `src/`:

```bash
DelhiMetroClean/
├── .github/          # GitHub Actions (EAS Builds, Releases)
├── assets/           # App icons, splash screens, map images
├── src/
│   ├── api/          # Network layer, HTTP clients, queries
│   ├── auth/         # Authentication logic and context
│   ├── components/   # Reusable UI components (Cards, Headers)
│   ├── config/       # Environment variables, constants
│   ├── di/           # Dependency Injection setup
│   ├── hooks/        # Custom React hooks
│   ├── navigation/   # Stack and Tab navigators (React Navigation)
│   ├── screens/      # Application screens (Home, MetroMap, Profile)
│   ├── services/     # Business logic (DMRC service, Map service)
│   ├── storage/      # Local storage and SQLite configurations
│   ├── theme/        # Global styling, colors, and fonts
│   └── types/        # TypeScript interfaces and types
├── App.tsx           # Application entry point wrapper
├── app.json          # Expo configuration file
└── package.json      # Dependencies and scripts
```

---

## ⚙️ Local Installation & Setup

Want to run the project locally? Follow these steps:

### 1. Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm** or **yarn**
- **Expo CLI** (Install via `npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator / Physical Device

### 2. Clone the Repository
```bash
git clone https://github.com/sidd-harth830/DelhiMetroClean.git
cd DelhiMetroClean
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and populate it with the required Appwrite and Expo variables. Here is an example of what your `.env` should look like:

```env
# Appwrite Client Variables (Exposed to the app)
EXPO_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
EXPO_PUBLIC_APPWRITE_PROJECT_ID="your_appwrite_project_id"
EXPO_PUBLIC_APPWRITE_DATABASE_ID="your_database_id"
EXPO_PUBLIC_APPWRITE_COLLECTION_ID="your_collection_id"

# Server/Admin Variables (Do not expose these to the client app)
APPWRITE_API_KEY="your_secret_admin_api_key"
GITHUB_REPO="username/repo"
```
> **Note**: These variables are loaded automatically by `react-native-dotenv` and Expo. Never commit your production `.env` file!

### 5. Run the Application
Start the development server:
```bash
npx expo start
```
- Press `a` to open on Android.
- Press `i` to open on iOS.
- Press `w` to open on the Web.

---

## 🚀 Roadmap

We are constantly improving the app! Here are a few features planned for future releases:
- [ ] **Multi-language Support**: Introducing Hindi language translations for local accessibility.
- [ ] **Smart Card Recharge**: Integrate a web-view or native payment flow to recharge metro cards directly from the app.
- [ ] **Offline Routing Engine**: Perform journey calculations natively on the device without an active internet connection using Expo SQLite data caching.
- [ ] **Push Notifications**: Receive instant alerts for train delays and line breakdowns.

---

## 🔧 Troubleshooting

Having trouble running the project? Here are some common fixes:

- **Metro Bundler Issues / Cache Errors:**
  If changes aren't reflecting or you get Metro bundle errors, clear the cache and restart:
  ```bash
  npx expo start --clear
  ```
- **Appwrite Connection Issues:**
  Ensure your `EXPO_PUBLIC_APPWRITE_ENDPOINT` is correctly set and your physical device/simulator has internet access to resolve API requests. If you are running Appwrite locally, ensure you use your machine's local IP address instead of `localhost`.
- **Dependency Conflicts:**
  If you face peer dependency warnings after an update, perform a clean install:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## 🤝 Contributing

Contributions are always welcome! Whether it's a bug report, feature suggestion, or a pull request, we value your feedback.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---
*Built with ❤️ for Delhi Commuters.*
