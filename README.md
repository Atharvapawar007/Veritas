# Focus & Flow - Productivity App

A React Native productivity app built with Expo and TypeScript, designed around principles from **Deep Work**, **Atomic Habits**, and **Thinking Fast and Slow**.

## 🎯 Features

### Core Functionality
- **Inbox & Quick Capture**: Quickly add tasks with title and optional notes
- **Focus Sessions**: Timer-based deep work sessions (25/50/90 min) with progress tracking
- **Habit Tracker**: Build micro-habits with streak tracking and daily completion
- **Daily Planning**: Select your top 3 most important tasks each day
- **Decision Pause Journal**: 3-question reflection tool for intentional decision-making
- **Analytics**: Weekly review with focus time, habit success rate, and insights

### Design Principles
- **Deep Work**: Distraction-free focus sessions with minimal UI during work
- **Atomic Habits**: Micro-goals and streak tracking to build lasting habits
- **Thinking Fast and Slow**: Decision pause feature for more deliberate choices

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on device/emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on your phone

## 📱 App Structure

### Screens
- **Home**: Dashboard with today's top 3 tasks, habits overview, and quick actions
- **Inbox**: Task capture and management
- **Focus Session**: Timer interface with progress ring and session tracking
- **Habits**: Habit creation, tracking, and streak visualization
- **Daily Planning**: Morning routine to select top 3 tasks
- **Analytics**: Weekly progress review and insights
- **Settings**: Preferences and data management

### Key Components
- **TaskList/TaskItem**: Task display and interaction
- **FocusTimer**: Circular progress timer with controls
- **HabitItem**: Habit tracking with streak display
- **AnalyticsChart**: Progress visualization
- **DailyPrompt**: Top 3 task selection interface

## 🗂️ Data Model

### Local Storage (AsyncStorage)
- **Tasks**: `{ id, title, note?, createdAt, dueAt?, status }`
- **Focus Sessions**: `{ id, startTime, endTime, plannedDuration, actualDuration, interruptions }`
- **Habits**: `{ id, title, microGoal, streak, history[] }`
- **Daily Top 3**: `{ date, taskIds[] }`
- **Journal Entries**: `{ id, timestamp, q1, q2, q3 }`
- **Settings**: Focus durations, notifications, reminders

## 🎨 Design Guidelines

- **Minimalist UI**: Clean, distraction-free interface
- **Neutral Colors**: White backgrounds, dark text, blue accents
- **Large Typography**: Readable fonts for timers and main content
- **StyleSheet Only**: No external styling libraries
- **iOS-Inspired**: Native feel with proper spacing and shadows

## 🔧 Technical Stack

- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **React Navigation** for tab and stack navigation
- **AsyncStorage** for local data persistence
- **React Context** for state management
- **React Native SVG** for progress rings and charts

## 📋 User Flow

1. **Morning Planning**: Set your top 3 tasks for the day
2. **Task Capture**: Add tasks to inbox as they come to mind
3. **Focus Work**: Start timed focus sessions on important tasks
4. **Habit Building**: Track daily micro-habits and build streaks
5. **Decision Making**: Use pause journal when feeling scattered
6. **Weekly Review**: Analyze progress and adjust approach

## 🎯 Productivity Philosophy

### Deep Work Principles
- Uninterrupted focus blocks
- Minimal interface during work
- Session logging and analysis

### Atomic Habits Framework
- Micro-goals (2-minute rule)
- Streak tracking for motivation
- Daily habit completion

### Slow Thinking Integration
- Decision pause for reactive moments
- Reflection questions for clarity
- Intentional task prioritization

## 🔄 Development

The app uses React Context for state management with automatic AsyncStorage persistence. All data is stored locally - no authentication or cloud sync required.

### Key Files
- `context/AppContext.tsx` - Global state management
- `services/storage.ts` - AsyncStorage operations
- `types/index.ts` - TypeScript interfaces
- `app/(tabs)/` - Main tab screens
- `app/focus-session.tsx` - Full-screen timer
- `app/daily-planning.tsx` - Morning planning flow

## 📊 No External Dependencies

- No Firebase, Supabase, or authentication
- No Tailwind, NativeWind, or CSS-in-JS
- No social features or cloud sync
- Pure React Native with minimal dependencies

Start building better habits and deeper focus today! 🚀
