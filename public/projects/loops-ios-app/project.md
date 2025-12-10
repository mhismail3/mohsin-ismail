---
title: Loops - Task Manager
slug: loops-ios-app
date: 2023-10-20
summary: An iOS task management app built with SwiftUI and Firebase. Features MVVM architecture, custom spring-based animations, and a polished tabbed interface with sliding highlights.
github: https://github.com/mhismail3/Loops-iOS-Todo-App
tags:
  - Swift
  - SwiftUI
  - Firebase
  - iOS
  - MVVM
status: Incomplete
cover: cover.jpg
gallery:
  - gallery-1.png
  - gallery-2.gif
  - gallery-3.gif
---

## A Native iOS Todo App

Loops was an experiment in building a native iOS app from scratch. I wanted to explore SwiftUI's declarative patterns and see if I could achieve the kind of fluid, spring-based animations that make iOS apps feel genuinely native rather than just functional.

The app follows MVVM architecture with a clean separation: `User` and `TaskItem` models, `@ObservableObject` ViewModels for each screen (`LoginViewViewModel`, `HomeViewViewModel`, `TabBarViewModel`), and declarative SwiftUI views. Authentication runs through Firebase Auth, with `MainView` acting as a simple router that conditionally renders either the login flow or the main interface based on sign-in state.

### Tuning the Animation Curves

I spent a bit of time getting the animations to feel right. The login screen uses a staggered entrance—the title slides down first, then the form fields, then the footer with the logo. Each element shares the same spring parameters (0.5s response, 0.5 damping fraction) so they feel cohesive even though they're offset in time. Validation errors animate in with a subtle Y-offset transition that draws attention without being jarring.

### The Sliding Tab Highlight

The custom `TabBar` component was probably the most fun to build. Rather than static tab buttons, there's a rounded highlight that slides to follow your selection with a spring animation. I used `GeometryReader` to dynamically calculate tab widths, then computed the highlight's X offset based on the selected index—with special handling to skip the center "New" button which triggers a popup instead of a tab switch.

Each page has associated properties defined in a `pagePropMap` dictionary: Inbox gets a blue accent, Today gets yellow, Lists gets pink. When you switch tabs, both the highlight position and its color animate simultaneously.

### A Proper Design System

I set up `Constants.swift` with a real typography scale: Lusitana (bold and regular weights) for titles, Poppins Medium for body text. Font sizes range from 54pt main titles down to 11pt tab labels. The custom fonts give it a distinct personality that stock system fonts wouldn't.

I also built a reusable `moveAndFade` transition extension that handles directional page changes—the title slides left or right depending on which way you're navigating, with opacity crossfade for polish.

### Why It's Incomplete

The authentication UI, tab navigation, and animation scaffolding are all solid. What's missing is the actual task management—the `TaskItem` model exists but CRUD operations were never implemented. The "New Item" popup renders but doesn't persist anywhere. I got pulled into other projects before connecting the polished UI to a real data layer. The bones are good though. Maybe someday.
