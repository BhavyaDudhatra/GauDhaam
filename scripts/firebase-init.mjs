import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(readFileSync("./serviceAccount.json", "utf8"));

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore(app);

const collections = [
  "products",
  "services",
  "orders",
  "users",
  "subscriptions",
  "b2b_requests",
  "feedback",
  "events",
  "gallery",
  "user_messages",
  "coupons",
  "addresses",
];

async function ensureCollections() {
  console.log("Initializing Firestore collections for project:", serviceAccount.project_id);
  for (const col of collections) {
    const docRef = db.collection(col).doc("_init");
    await docRef.set({ createdAt: FieldValue.serverTimestamp(), note: "init placeholder" });
    await docRef.delete();
    console.log(`✓ ${col}`);
  }
  console.log("All collections are ready.");
}

ensureCollections().catch(err => {
  console.error("Init failed:", err);
  process.exit(1);
});
