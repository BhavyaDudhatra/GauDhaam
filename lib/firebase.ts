/**
 * Firebase Admin / Firestore connection.
 * firebase-admin is imported lazily so the local fallback stays fast in dev.
 */

export function isFirebaseConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

let settingsApplied = false;

export async function getDb() {
  if (!isFirebaseConfigured()) return null;

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = getFirestore();

  if (!settingsApplied) {
    db.settings({ ignoreUndefinedProperties: true });
    settingsApplied = true;
  }

  return db;
}
