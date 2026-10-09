# CampusConnect Mobile

Expo (SDK 57) + Expo Router app for students, built on the same FastAPI backend as the web app.

## Features

| Area | What it does | API |
| --- | --- | --- |
| Auth | Sign in, sign up, auto token refresh, tokens in Keychain/Keystore (`expo-secure-store`) | `/auth/*` |
| Home | Next registered event, quick stats, upcoming events | `GET /events/` |
| Events | Search, filter by time and category, pull to refresh | `GET /events/` |
| Event details | Info, capacity bar, share, register (prefilled from profile) | `GET /events/{slug}`, `POST /events/{slug}/register` |
| Clubs | Search and category filter across all clubs | `GET /clubs/` |
| Club details | About, leadership, club events, socials, membership status | `GET /clubs/{slug}`, `/members`, `/events` |
| Join club | Razorpay Checkout in a WebView, then server-side signature verification | `POST /payments/club-membership/order`, `POST /payments/verify` |
| Admin access | Students request to manage a club; status shows on Profile | `/club-admin-requests*` |
| Profile | Details, my events, request status, sign out | `GET /auth/me` |
| Club dashboard | Read-only stats and event approval status for club admins | `/club-admin/*` |

## Run it

```bash
cd mobile
npm install
npx expo start          # scan the QR code with Expo Go
```

Everything runs in Expo Go, including payments (Razorpay's web checkout inside `react-native-webview`).

The app talks to the deployed API by default (`app.json → expo.extra.apiUrl`). To point it at a local backend, create `mobile/.env.local`:

```bash
# Use your Mac's LAN IP — "localhost" on a phone means the phone itself.
EXPO_PUBLIC_API_URL=http://192.168.1.20:8000/api/v1
```

> The Render free tier sleeps after inactivity, so the first request can take ~50 seconds. The app waits up to 60s and shows a hint while signing in.

## Checks

```bash
npm run typecheck
npm run lint
```

## Structure

```
src/
  app/                 # routes (Expo Router)
    _layout.tsx        # auth gate via Stack.Protected
    (auth)/            # sign-in, sign-up
    (tabs)/            # home, events, clubs, profile
    event/[slug].tsx   # event details
    event/register.tsx # registration modal
    club/[slug].tsx    # club details
    club/join.tsx      # membership + Razorpay
    club/request.tsx   # request club-admin access
    my-events.tsx
    club-dashboard.tsx
  components/          # UI kit, cards, Razorpay WebView
  lib/                 # api client, auth context, hooks, theme, formatting
```

## Building

```bash
npx eas-cli@latest build --profile preview --platform android   # installable APK
```
