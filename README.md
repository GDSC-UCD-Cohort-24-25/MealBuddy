<p align="center">
  <img src="./MealBuddy/images/mealbuddy_icon.png" alt="MealBuddy Logo" width="200"/>
</p>

<h1 align="center">MealBuddy – AI-Powered Meal Planning App</h1>

<p align="center">
  An AI health planning app that helps you track ingredients, get personalized recipe suggestions, and monitor your nutrition.
</p>

---

## Overview

MealBuddy is a personalized mobile application that suggests recipes and meal ideas based on the ingredients you have on hand. By tracking your past meal choices, dietary preferences, and fridge inventory, MealBuddy continually refines its recommendations to promote healthier eating habits, reduce food waste, and save you money. It simplifies meal prep with AI-driven meal plans tailored to your schedule and nutrition goals.

---

## Inspiration

Over one-third of U.S. consumers (38%) frequently don't know what to make at mealtimes—10% "very often" and 28% "frequently." This uncertainty often leads to nutritional imbalances, excessive food waste, and the frustration of juggling complex schedules and dietary needs, especially for busy families and younger adults. MealBuddy was born to tackle these pain points by delivering instant, inventory-based meal suggestions that fit real-world routines and individual preferences.

---

## 📺 Demo

<p align="center">
  <a href="https://m.youtube.com/watch?v=pTFzHRhEiUc">
    <img src="https://img.shields.io/badge/Demo-Watch%20Now-red?style=for-the-badge&logo=youtube" alt="Watch Demo"/>
  </a>
  <a href="https://medium.com/@gdsc_ucdavis/meal-buddy-2c9e1d02b1e1">
    <img src="https://img.shields.io/badge/Read%20on-Medium-black?style=for-the-badge&logo=medium" alt="Medium Article"/>
  </a>
</p>
---

## 🚀 Features (In Progress)

- **Ingredient Tracking**  
  Log, search, and manage what's in your fridge.
- **AI-Powered Chatbot**  
  Ask "What can I make?" to get Gemini-powered recipe ideas.
- **Dynamic Dashboards**  
  View calories, macronutrient breakdowns, and progress charts.

---

## 🛠 Tech Stack

- **Frontend:** React Native (Expo), React Navigation, styled-components / Tailwind CSS  
- **Backend:** Firebase Authentication & Firestore  
- **AI Integration:** Google Gemini API for recipe generation  
- **Design:** Figma for UI/UX prototypes  

---

## 📋 Prerequisites

1. **Node.js & npm** – Install LTS from [https://nodejs.org](https://nodejs.org)
2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```
3. **(iOS only, bare workflow)**
   ```bash
   sudo gem install cocoapods
   ```

---

## 🔧 Installation & Setup

1. **Clone this repo**
   ```bash
   git clone https://github.com/your-username/mealbuddy.git
   cd mealbuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your .env**
   
   ```
   GOOGLE_GEMINI_API_KEY=your_gemini_key
   YOUTUBE_API_KEY=your_youtube_key
   EXPO_CLIENT_ID=...
   IOS_CLIENT_ID=...
   ANDROID_CLIENT_ID=...
   FIREBASE_API_KEY=...
   FIREBASE_AUTH_DOMAIN=...
   FIREBASE_PROJECT_ID=...
   FIREBASE_STORAGE_BUCKET=...
   FIREBASE_MESSAGING_SENDER_ID=...
   FIREBASE_APP_ID=...
   ```

4. **(iOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

---

## ▶️ Running the App

```bash
npm run start
# or
expo start
```

Scan the QR code with Expo Go (iOS/Android)

Or press i / a to launch in simulator/emulator

---

## 📂 Project Structure

```
├── assets/
│   └── images/mealbuddy_icon.png
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Dashboard, YourFridge, AddIngredients, ChatBot…
│   ├── services/        # firebase_config.js, auth_service.js
│   ├── styles/          # JS style files (dashboard_styles.js, chatbot_styles.js…)
│   └── navigation/      # AppNavigator, MainTabs, AuthStack
├── .env.example
├── App.js
└── package.json
```

---

## 📈 Usage

1. **Sign Up / Log In**
   - Email/password or Google SSO

2. **Add Ingredients**
   - Search, specify quantity, and save to your fridge

3. **View "Your Fridge"**
   - Browse, search, or delete items

4. **Dashboard**
   - See your nutrition summary and progress charts

5. **Chatbot**
   - Ask "What meals can I make?" for AI-generated recipes and links

---

## 🔮 Roadmap

- Calendar view for past meals
- Photo-based inventory (receipt upload, barcode scan)
- Expiry-date alerts for perishables

