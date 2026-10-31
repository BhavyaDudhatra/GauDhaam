# GauDhaam - E-commerce & Services Web Application

A fully functional, production-ready e-commerce & services web application built with Next.js, Tailwind CSS, and Firebase.

## Features

### User Features
- **Authentication**: Email/Password with OTP verification
- **Shop**: Browse organic products (Dairy, Soaps, Wellness)
- **Services**: Eco Tourism, Cottage Booking, Event Venue, Training Programs
- **Cart & Checkout**: Shopping cart with Cash on Delivery
- **User Dashboard**: Track orders and bookings

### Admin Features
- **Product Management**: Add, edit, delete products
- **Service Management**: Manage services and bookings
- **Image Upload**: Google Drive API integration for images (no Firebase Storage)
- **Order Management**: Track and update order status
- **Booking Management**: Manage all booking requests

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend/Auth**: Firebase (Auth, Firestore)
- **Image Storage**: Google Drive API
- **Deployment**: Vercel

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

<!-- ### 2. Environment Variables -->
<!-- Copy `.env.example` to `.env.local` and fill in your credentials: -->

```bash
# cp .env.example .env.local
```

### 3. Firebase Setup
1. Create a Firebase project
2. Enable Email/Password authentication
3. Create Firestore database
4. Get Firebase config and Admin SDK credentials

### 4. Google Drive API Setup
1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a Service Account
4. Create a folder in Google Drive and get its ID
5. Share the folder with the service account email
6. Add credentials to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

## Design System
- Primary Green: `#496B45`
- Dark Green: `#2F4930`
- Accent Brown: `#795548`
- Cream Background: `#FFF8EF`
- Light Green: `#EAF1E5`
- Border Color: `#E9DFD0`
- Text Gray: `#655B54`

## Deployment
Deploy to Vercel with environment variables configured.
