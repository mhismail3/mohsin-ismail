---
title: Niya
slug: niya
date: 2026-04-03
summary: A comprehensive Islamic learning and prayer companion for iOS — full Quran reader with tajweed highlighting, astronomical prayer time calculations, 9 hadith collections, 267+ duas, and verse-synced audio from 9 reciters. Built entirely with Apple frameworks, zero third-party dependencies.
github: https://github.com/mhismail3/niya
live: https://apps.apple.com/us/app/niya-make-your-intention/id6759700883
tags:
  - Swift
  - SwiftUI
  - SwiftData
  - WidgetKit
  - CoreLocation
  - AVFoundation
  - iOS
  - Python
status: "🚀 Shipped"
cover: cover.png
gallery:
  - gallery-1.png
  - gallery-2.png
  - gallery-3.png
  - gallery-4.png
  - gallery-5.png
  - gallery-6.png
  - gallery-7.png
---

## An All-in-One Islamic Companion

Most Islamic apps I've used fall into one of two camps: either they do one thing well but force you to juggle five different apps for your daily needs, or they try to do everything but are buried in ads and clunky UI. I wanted a single, polished app that handles the Quran, prayer times, hadith, and duas — offline-first, no accounts required for basic functionality, and with proper Arabic rendering that doesn't butcher the text.

I also set a constraint early on: zero third-party dependencies. Every feature uses only Apple's first-party frameworks — SwiftUI, SwiftData, AVFoundation, CoreLocation, WidgetKit, and so on. This kept the binary small, avoided supply-chain risk, and forced me to engage deeply with the platform APIs rather than reaching for a pod every time something got hard. The entire app — Quran reader, prayer calculator, audio streaming, widgets — is built on what ships with Xcode.

---

## The Interesting Bits

### Prayer Time Calculation Engine

Prayer times aren't static schedules — they're defined by the sun's position relative to the observer. Fajr begins when the sun drops to a specific angle below the horizon before dawn. Dhuhr is solar noon. Asr depends on shadow length ratios. Maghrib is sunset. Isha is another angle-based threshold after dusk. Getting these right means doing real astronomy, not calling an API.

The calculator implements the NOAA solar ephemeris method. It converts the current date to a Julian Day number, then computes the sun's geometric mean longitude, mean anomaly, equation of center (a three-term trigonometric series), and apparent longitude with nutation and aberration corrections. From those, it derives the sun's declination and the equation of time, which together determine when the sun reaches any given elevation angle at the user's latitude.

The core of it is the hour angle calculation — spherical trigonometry that answers "at what time does the sun hit this angle?" For Asr, instead of a fixed angle, the elevation is computed as `arctan(1 / (asrFactor + tan(|declination - latitude|)))`, where `asrFactor` is 1 (Shafi'i) or 2 (Hanafi) depending on the juristic method. The whole thing runs through a two-pass convergence iteration to nail down accurate times at the user's specific coordinates.

The app supports 20+ calculation methods — Muslim World League, ISNA, Egyptian, Umm al-Qura (Makkah), Karachi, Tehran, Jafari, and others — each defining different Fajr and Isha angle thresholds (ranging from 12° to 20°). Some methods like Umm al-Qura use fixed minutes-after-maghrib for Isha instead of an angle. All of this runs locally. No network calls, no API keys, no rate limits. You get accurate prayer times for any location on Earth, fully offline.

### Tajweed Highlighting

Tajweed rules govern how each letter of the Quran should be pronounced — nasalization, assimilation, elongation, and so on. Niya renders 21 distinct rules as color-coded overlays directly on the Arabic text: ghunnah, ikhfa, idgham (with and without nasalization), iqlab, qalqalah, four types of madd, silent letters, lam shamsiyyah, hamzat al-wasl, and several others.

The rendering uses a two-layout system built on Core Text. The base `NSLayoutManager` handles text positioning and line breaking for the Arabic script. Then, for each tajweed rule, a separate overlay layout renders just the affected character ranges using clipping paths with `.copy` blend mode in `CGContext`. This avoids the complexity of merging overlapping attributed string ranges — each rule gets its own clean pass over the text.

The annotations themselves are resolved at build time. A Python script in the data pipeline maps character-level rule annotations from the source text (Tanzil Uthmanic encoding) to the app's display text (Hafs script), handling basmala stripping and index shifts. At runtime, `TajweedTextResolver` converts those annotations into contiguous segments, resolving overlaps with a last-annotation-wins strategy. Swift String indices get converted to UTF-16 ranges for Core Text compatibility, and the whole thing iterates line-by-line for proper RTL rendering.

I also had to patch the KFGQPC Uthmanic Script font — certain Unicode Quranic marks in the U+06D6–U+06DC range needed glyph substitutions to render correctly. The app swaps visually equivalent glyphs (Small High Rounded Zero to Rectangular Zero, for example) without stripping characters, so fallback fonts can still handle anything the primary font doesn't support.

### Audio Streaming and Follow-Along Mode

The audio system supports 9 reciters and operates in three modes: per-verse playback (separate audio files for each ayah), per-surah continuous (a single file with verse boundary timestamps), and word-by-word mode (surah audio synced to millisecond-accurate word timing data).

Follow-along mode is the most interesting. Each surah has word-level timing data — start and end milliseconds for every word in the recitation. When audio plays, a periodic time observer fires every 200ms and the `FollowAlongViewModel` runs a binary search over the word array to find which word corresponds to the current playback position. The matching word highlights in the text, words already passed show as completed, and upcoming words stay dimmed. Tapping any word plays its individual pronunciation via a separate `AVPlayer` instance.

For surah-level audio, verse boundaries are stored as an array of start/end millisecond offsets. The audio service iterates these in reverse on each time observer tick to find the current verse — simple and efficient since the number of verses per surah is small. When you seek to a specific verse, it jumps to that verse's start millisecond without restarting the player, preserving the audio session. Verse completion triggers a 15-step exponential fade-out over 500ms before advancing.

The player integrates with `MPNowPlayingInfoCenter` for lock screen controls and handles AVFoundation's interruption lifecycle — phone calls, Siri, other audio sessions — resuming cleanly when the interruption ends.

### The Data Pipeline

All the content in Niya — Quran text in two scripts, 15+ translations, multiple tafsir editions, 9 hadith collections, 267+ duas, word morphology, and audio timing data — ships as bundled JSON, built by a Python pipeline in `DataPrep/`.

The orchestrator (`gen_project.py`, ~1,700 lines) coordinates fetches from multiple upstream sources: Tanzil for Quran text, Quran.com's API v4 for word-level timing and transliteration, the Quranic Arabic Corpus for morphological analysis, and various repositories for tafsir and hadith. Each data source has its own build script with rate limiting (0.5s between requests, exponential backoff on failure) and local caching so rebuilds don't hammer upstream APIs.

The word data fetch is the heaviest — it pulls per-surah recitation segments with millisecond accuracy for 7 reciters, producing the timing data that powers follow-along mode. Output files are optionally zlib-compressed for 60–70% size reduction. The tajweed build script cross-validates annotation coverage against the source text to catch mapping errors before they ship.

### SwiftData and Cloud Sync

Persistence uses SwiftData with `@Model` macros — reading positions, color-coded bookmarks (verses, hadiths, duas), audio download records, and search history. The schema is intentionally lightweight: each model stores just enough to reconstruct state, with computed properties bridging between stored string tags and Swift enums.

Bookmarks and reading positions sync across devices via SwiftData's built-in CloudKit integration. Cached audio and computed prayer times stay local — they're device-specific and would waste iCloud bandwidth. The migration path is designed for post-1.0 evolution: SwiftData's automatic schema migration handles simple additions, with custom migration logic ready for anything structural.

### Widgets

WidgetKit widgets show the next prayer time on the home screen and lock screen. The timeline provider loads prayer data from shared `UserDefaults` (written by the main app via `WidgetDataWriter`), then generates timeline entries at each prayer transition throughout the day.

If the cached data is stale or missing — the app hasn't been opened in a while, or the user just installed — the widget falls back to computing prayer times directly using `PrayerTimeCalculator` with a default location. The refresh policy schedules after the last prayer plus 30 minutes, keeping the widget current without unnecessary background wake-ups.

---

## What's Next

The 1.0 is solid for daily use — I rely on it myself for prayer times and Quran reading. There's more to build though: Ramadan-specific features (suhoor/iftar countdowns, daily reading plans), an Apple Watch complication for prayer times at a glance, and expanding the audio library with more reciters and per-word pronunciation for learning. The data pipeline makes adding new content straightforward — it's mostly a matter of finding quality sources and validating the output.
