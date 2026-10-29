const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { randomUUID } = require("crypto");
const { readFileSync } = require("fs");
const crypto = require("crypto");

const env = readFileSync(".env.local", "utf8");
const get = (k) => {
  const m = env.match(new RegExp("^" + k + "=(.*)$", "m"));
  if (!m) return "";
  let v = m[1].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/\\n/g, "\n");
  return v;
};

const app = initializeApp({
  credential: cert({
    projectId: get("FIREBASE_PROJECT_ID"),
    clientEmail: get("FIREBASE_CLIENT_EMAIL"),
    privateKey: get("FIREBASE_PRIVATE_KEY"),
  }),
});

const db = getFirestore(app);

const ADMIN_EMAIL = get("ADMIN_EMAIL") || "admin@gaudham.in";
const ADMIN_PASSWORD = get("ADMIN_PASSWORD") || "Gaudham@123";
const ADMIN_NAME = "Gaudham Admin";

function hash(p) {
  const salt = crypto.randomBytes(16).toString("hex");
  const h = crypto.scryptSync(p, salt, 64).toString("hex");
  return `${salt}:${h}`;
}

const image = (name) => `/assets/images/${name}`;

const seedProducts = [
  { slug: "a2-bilona-cow-ghee", name: "A2 Bilona Cow Ghee", category: "Ghee", shortDescription: "Slow-churned A2 ghee with a grainy texture and a deep, nutty aroma.", description: "Made from the milk of free-grazing indigenous cows, our ghee is cultured overnight and churned the traditional bilona way.", highlights: ["Made from A2 milk of native cow breeds", "Cultured and churned by hand, in small batches", "Slow-simmered for a grainy texture and nutty aroma", "Packed in reusable glass jars"], ingredients: "100% A2 cow milk fat.", howToUse: "Use a dry spoon. Ideal for tempering dal.", images: [image("Ghee.jpg"), image("gheehome.jpg")], variants: [{ id: "ghee-500ml", label: "500 ml", price: 899, mrp: 1049, stock: 42, active: true }, { id: "ghee-1l", label: "1 litre", price: 1699, mrp: 1999, stock: 26, active: true }], offer: { type: "percentage", value: 10, label: "Farm fresh offer" }, featured: true, available: true },
  { slug: "a2-gir-cow-ghee", name: "A2 Gir Cow Ghee", category: "Ghee", shortDescription: "A deeper, more caramel note from a single herd of Gir cows.", description: "Our Gir cow ghee comes from one small herd.", highlights: ["Single-herd Gir cow milk", "Hand-churned in earthen pots", "Caramel notes"], ingredients: "100% A2 Gir cow milk fat.", howToUse: "Wonderful in halwa.", images: [image("Ghee.jpg")], variants: [{ id: "gir-500ml", label: "500 ml", price: 1099, mrp: 1249, stock: 18, active: true }, { id: "gir-1l", label: "1 litre", price: 2049, mrp: null, stock: 9, active: true }], offer: null, featured: true, available: true },
  { slug: "wild-forest-honey", name: "Wild Forest Honey", category: "Honey", shortDescription: "Raw, unfiltered honey gathered from wild combs in the Satpura hills.", description: "Never heated and never fine-filtered.", highlights: ["Raw, unheated and unfiltered", "Harvested from wild combs", "Naturally crystallises"], ingredients: "100% wild forest honey.", howToUse: "Stir into warm water.", images: [image("Honey.jpg")], variants: [{ id: "wild-250g", label: "250 g", price: 349, mrp: 399, stock: 60, active: true }, { id: "wild-500g", label: "500 g", price: 649, mrp: 749, stock: 34, active: true }, { id: "wild-1kg", label: "1 kg", price: 1199, mrp: 1449, stock: 14, active: true, offer: { type: "fixed", value: 100, label: "Harvest offer" } }], offer: null, featured: true, available: true },
  { slug: "multiflora-raw-honey", name: "Multiflora Raw Honey", category: "Honey", shortDescription: "A mellow everyday honey from our own hives at the farm.", description: "Cold extracted and gravity settled.", highlights: ["From hives at the Gaudham farm", "Cold extracted", "Mild enough for children"], ingredients: "100% raw multiflora honey.", howToUse: "Perfect for smoothies.", images: [image("Honey.jpg")], variants: [{ id: "multi-250g", label: "250 g", price: 299, mrp: null, stock: 48, active: true }, { id: "multi-500g", label: "500 g", price: 549, mrp: 599, stock: 0, active: true }], offer: null, featured: false, available: true },
  { slug: "herbal-hair-oil", name: "Herbal Hair Oil", category: "Herbal", shortDescription: "Cold-pressed sesame oil steeped with bhringraj, amla and neem.", description: "Steeped for three weeks.", highlights: ["Cold-pressed sesame base", "Bhringraj, amla, neem and brahmi", "No mineral oil"], ingredients: "Cold-pressed sesame oil, bhringraj, amla, neem, brahmi.", howToUse: "Warm slightly and massage into the scalp.", images: [image("herbaloil.jpg"), image("planthome.jpg")], variants: [{ id: "oil-100ml", label: "100 ml", price: 399, mrp: 449, stock: 30, active: true }, { id: "oil-200ml", label: "200 ml", price: 729, mrp: 849, stock: 22, active: true, offer: { type: "percentage", value: 8, label: "Herbal care offer" } }], offer: null, featured: true, available: true },
  { slug: "herbal-face-powder", name: "Herbal Face Powder", category: "Herbal", shortDescription: "A stone-ground blend of rose, sandalwood and turmeric.", description: "Stone-ground on a slow mill.", highlights: ["Stone-ground, double sifted", "Rose, sandalwood and turmeric"], ingredients: "Rose petals, sandalwood powder, turmeric, chickpea flour.", howToUse: "Mix with rose water.", images: [image("Herbalpowder.jpg")], variants: [{ id: "powder-100g", label: "100 g", price: 349, mrp: 399, stock: 40, active: true }, { id: "powder-200g", label: "200 g", price: 649, mrp: 749, stock: 25, active: true }], offer: null, featured: false, available: true },
  { slug: "neem-turmeric-soap", name: "Neem & Turmeric Soap", category: "Soap", shortDescription: "A cold-processed bar with neem leaf and a touch of turmeric.", description: "Cold-processed and cured for six weeks.", highlights: ["Cold-processed", "Coconut and olive oil base", "Palm-oil free"], ingredients: "Coconut oil, olive oil, neem powder, turmeric.", howToUse: "Keep dry between uses.", images: [image("soap.jpg")], variants: [{ id: "soap-100g", label: "Single bar · 100 g", price: 199, mrp: 249, stock: 80, active: true }, { id: "soap-pack3", label: "Pack of 3", price: 549, mrp: 699, stock: 40, active: true, offer: { type: "fixed", value: 50, label: "Bundle saving" } }], offer: null, featured: true, available: true },
  { slug: "rose-sandalwood-soap", name: "Rose & Sandalwood Soap", category: "Soap", shortDescription: "A gentle, rose-scented bar for everyday bathing.", description: "Mild enough for daily use.", highlights: ["Infused with real rose petals", "Mild enough for daily use"], ingredients: "Coconut oil, olive oil, rose infusion, sandalwood powder.", howToUse: "Lather and rinse.", images: [image("soap.jpg")], variants: [{ id: "rose-100g", label: "Single bar · 100 g", price: 219, mrp: 249, stock: 0, active: true }, { id: "rose-pack3", label: "Pack of 3", price: 599, mrp: 699, stock: 26, active: true }], offer: { type: "percentage", value: 5 }, featured: false, available: true },
];

const seedServices = [
  { slug: "monthly-pantry-subscription", name: "Monthly Pantry Subscription", tagline: "Ghee, honey and a rotating herbal essential, delivered at the start of every month.", description: "A simple way to keep the pantry stocked without thinking about it.", highlights: ["Ghee, honey and one rotating herbal essential", "Free delivery anywhere in India", "Pause or skip whenever you need"], images: [image("gheehome.jpg"), image("planthome.jpg")], priceNote: "From ₹1,499 / month", active: true, sort: 1 },
  { slug: "corporate-gifting", name: "Corporate & Festive Gifting", tagline: "Thoughtful hampers for teams, clients and festivals, packed by hand.", description: "We build small-batch hampers.", highlights: ["Custom combinations and budgets", "Handwritten notes on request", "Multi-address shipping"], images: [image("banner.jpg"), image("herbalbanner.jpg")], priceNote: "Minimum 20 hampers", active: true, sort: 2 },
  { slug: "ayurvedic-consultation", name: "Ayurvedic Wellness Consultation", tagline: "A slow, unhurried conversation about food, sleep and everyday health.", description: "45-minute online consultation.", highlights: ["45-minute online session", "Written summary within two days"], images: [image("aboutus.jpg"), image("conus.jpg")], priceNote: "₹899 per session", active: true, sort: 3 },
  { slug: "farm-visit", name: "A Morning at the Farm", tagline: "See the herd, walk the herb garden and churn butter with us.", description: "Once a month farm visit.", highlights: ["Small groups of twelve or fewer", "Meet the herd", "Farm breakfast included"], images: [image("aboutus.jpg"), image("gheehome.jpg")], priceNote: "₹650 per person", active: true, sort: 4 },
];

const seedCoupons = [
  { code: "WELCOME10", description: "10% off your first order, up to ₹150.", type: "percentage", value: 10, minOrderValue: 499, maxDiscount: 150, usageLimit: null, active: true },
  { code: "GAUDHAM200", description: "₹200 off orders above ₹1,499.", type: "fixed", value: 200, minOrderValue: 1499, maxDiscount: null, usageLimit: null, active: true },
];

async function seed() {
  const batch = db.batch();
  const now = new Date().toISOString();
  
  const adminRef = db.collection("users").doc(randomUUID());
  batch.set(adminRef, { id: adminRef.id, name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), phone: "", passwordHash: hash(ADMIN_PASSWORD), role: "admin", emailVerified: true, createdAt: now });
  console.log("Added admin:", ADMIN_EMAIL);
  
  seedProducts.forEach((p, i) => {
    const ref = db.collection("products").doc(randomUUID());
    batch.set(ref, { ...p, id: ref.id, createdAt: new Date(Date.now()-i*1000).toISOString(), updatedAt: now });
  });
  console.log("Added", seedProducts.length, "products");
  
  seedServices.forEach((s, i) => {
    const ref = db.collection("services").doc(randomUUID());
    batch.set(ref, { ...s, id: ref.id, createdAt: now, updatedAt: now });
  });
  console.log("Added", seedServices.length, "services");
  
  seedCoupons.forEach((c) => {
    const ref = db.collection("coupons").doc(randomUUID());
    batch.set(ref, { ...c, id: ref.id, usedCount: 0, createdAt: now, updatedAt: now });
  });
  console.log("Added", seedCoupons.length, "coupons");
  
  await batch.commit();
  console.log("Done!");
}

seed().catch(console.error);
