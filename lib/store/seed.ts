import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/password";
import type { Coupon, ProductInput, ServiceInput, User } from "@/lib/types";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gaudham.in";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Gaudham@123";
export const ADMIN_NAME = "Gaudham Admin";

export function buildSeedAdmin(): User {
  return {
    id: randomUUID(),
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.trim().toLowerCase(),
    phone: "",
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: "admin",
    emailVerified: true,
    createdAt: new Date().toISOString(),
  };
}

const image = (name: string) => `/assets/images/${name}`;

export const seedProducts: ProductInput[] = [
  {
    slug: "a2-bilona-cow-ghee",
    name: "A2 Bilona Cow Ghee",
    category: "Ghee",
    shortDescription:
      "Slow-churned A2 ghee with a grainy texture and a deep, nutty aroma.",
    description:
      "Made from the milk of free-grazing indigenous cows, our ghee is cultured overnight and churned the traditional bilona way. The butter is then simmered slowly over a low flame until it turns golden and fragrant.\n\nNothing is added along the way — no colours, no preservatives, no shortcuts. What reaches your kitchen is simply milk, patience and care.",
    highlights: [
      "Made from A2 milk of native cow breeds",
      "Cultured and churned by hand, in small batches",
      "Slow-simmered for a grainy texture and nutty aroma",
      "Packed in reusable glass jars",
    ],
    ingredients:
      "100% A2 cow milk fat. Contains no added colour, flavour or preservative.",
    howToUse:
      "Use a dry spoon. Ideal for tempering dal, spreading on hot rotis, or a teaspoon on an empty stomach in the morning.",
    images: [image("Ghee.jpg"), image("gheehome.jpg")],
    variants: [
      { id: "ghee-500ml", label: "500 ml", price: 899, mrp: 1049, stock: 42, active: true },
      { id: "ghee-1l", label: "1 litre", price: 1699, mrp: 1999, stock: 26, active: true },
    ],
    offer: { type: "percentage", value: 10, label: "Farm fresh offer" },
    featured: true,
    available: true,
  },
  {
    slug: "a2-gir-cow-ghee",
    name: "A2 Gir Cow Ghee",
    category: "Ghee",
    shortDescription:
      "A deeper, more caramel note from a single herd of Gir cows.",
    description:
      "Our Gir cow ghee comes from one small herd in Madhya Pradesh. The milk is boiled in iron vessels, set into curd overnight, and churned by hand the next morning. The resulting butter is simmered for close to an hour, giving it a darker golden colour and a warm caramel finish.\n\nThis is a limited batch — we only make it when the herd gives us enough cream.",
    highlights: [
      "Single-herd Gir cow milk",
      "Hand-churned in earthen pots",
      "Caramel notes, ideal for sweets and halwa",
      "Limited batches through the year",
    ],
    ingredients: "100% A2 Gir cow milk fat.",
    howToUse:
      "Wonderful in halwa, ladoos and biryani. Store in a cool, dry place; refrigerate after opening.",
    images: [image("Ghee.jpg")],
    variants: [
      { id: "gir-500ml", label: "500 ml", price: 1099, mrp: 1249, stock: 18, active: true },
      { id: "gir-1l", label: "1 litre", price: 2049, mrp: null, stock: 9, active: true },
    ],
    offer: null,
    featured: true,
    available: true,
  },
  {
    slug: "wild-forest-honey",
    name: "Wild Forest Honey",
    category: "Honey",
    shortDescription:
      "Raw, unfiltered honey gathered from wild combs in the Satpura hills.",
    description:
      "Every spring, our beekeepers climb to wild combs in the Satpura range and harvest only the surplus. The honey is never heated and never fine-filtered, so it keeps its pollen, enzymes and a flavour that changes a little with every harvest.\n\nIt crystallises naturally in winter. That is a sign of real honey — stand the jar in warm water and it will turn liquid again.",
    highlights: [
      "Raw, unheated and unfiltered",
      "Harvested from wild combs",
      "Naturally crystallises in cold weather",
      "Bottled in glass, never plastic",
    ],
    ingredients: "100% wild forest honey. Nothing added.",
    howToUse:
      "Stir into warm water or tea below 40°C. A spoon over curd or toast is our favourite.",
    images: [image("Honey.jpg")],
    variants: [
      { id: "wild-250g", label: "250 g", price: 349, mrp: 399, stock: 60, active: true },
      { id: "wild-500g", label: "500 g", price: 649, mrp: 749, stock: 34, active: true },
      {
        id: "wild-1kg",
        label: "1 kg",
        price: 1199,
        mrp: 1449,
        stock: 14,
        active: true,
        offer: { type: "fixed", value: 100, label: "Harvest offer" },
      },
    ],
    offer: null,
    featured: true,
    available: true,
  },
  {
    slug: "multiflora-raw-honey",
    name: "Multiflora Raw Honey",
    category: "Honey",
    shortDescription:
      "A mellow everyday honey from our own hives at the farm.",
    description:
      "This is the honey we keep on the breakfast table. Bees forage on the flowering trees around the farm — neem, jamun and the odd patch of mustard — which gives a mellow, buttery honey that is less intense than the forest harvest.\n\nWe extract it cold and let it settle for a week before bottling.",
    highlights: [
      "From hives at the Gaudham farm",
      "Cold extracted and gravity settled",
      "Mild enough for children",
      "Every jar is dated by harvest",
    ],
    ingredients: "100% raw multiflora honey.",
    howToUse: "Perfect for smoothies, baking and everyday breakfasts.",
    images: [image("Honey.jpg")],
    variants: [
      { id: "multi-250g", label: "250 g", price: 299, mrp: null, stock: 48, active: true },
      { id: "multi-500g", label: "500 g", price: 549, mrp: 599, stock: 0, active: true },
    ],
    offer: null,
    featured: false,
    available: true,
  },
  {
    slug: "herbal-hair-oil",
    name: "Herbal Hair Oil",
    category: "Herbal",
    shortDescription:
      "Cold-pressed sesame oil steeped with bhringraj, amla and neem.",
    description:
      "We steep a dozen herbs in cold-pressed sesame oil for three weeks, stirring every morning and keeping the jars in filtered sunlight. The oil is then strained through muslin and bottled without fragrance or mineral oil.\n\nThe result is a deep green oil with an earthy smell — the way hair oil smelled before it became a perfume.",
    highlights: [
      "Cold-pressed sesame base",
      "Bhringraj, amla, neem and brahmi",
      "No mineral oil, no synthetic fragrance",
      "Steeped slowly over three weeks",
    ],
    ingredients:
      "Cold-pressed sesame oil, bhringraj, amla, neem, brahmi, fenugreek, curry leaf.",
    howToUse:
      "Warm slightly and massage into the scalp once or twice a week. Leave for an hour or overnight before washing.",
    images: [image("herbaloil.jpg"), image("planthome.jpg")],
    variants: [
      { id: "oil-100ml", label: "100 ml", price: 399, mrp: 449, stock: 30, active: true },
      {
        id: "oil-200ml",
        label: "200 ml",
        price: 729,
        mrp: 849,
        stock: 22,
        active: true,
        offer: { type: "percentage", value: 8, label: "Herbal care offer" },
      },
    ],
    offer: null,
    featured: true,
    available: true,
  },
  {
    slug: "herbal-face-powder",
    name: "Herbal Face Powder",
    category: "Herbal",
    shortDescription:
      "A stone-ground blend of rose, sandalwood and turmeric.",
    description:
      "We grind rose petals, sandalwood, turmeric and a little chickpea flour on a slow stone mill, sieving twice for a soft finish. There are no fillers, no talc and no added fragrance.\n\nMix with rose water, curd or honey for a weekly face pack that cleanses without stripping the skin.",
    highlights: [
      "Stone-ground, double sifted",
      "Rose, sandalwood and turmeric",
      "Talc-free and fragrance-free",
      "Suitable for a weekly face pack",
    ],
    ingredients:
      "Rose petals, sandalwood powder, turmeric, chickpea flour, vetiver.",
    howToUse:
      "Mix one teaspoon with rose water or curd into a paste. Apply for 10 minutes and rinse with cool water.",
    images: [image("Herbalpowder.jpg")],
    variants: [
      { id: "powder-100g", label: "100 g", price: 349, mrp: 399, stock: 40, active: true },
      { id: "powder-200g", label: "200 g", price: 649, mrp: 749, stock: 25, active: true },
    ],
    offer: null,
    featured: false,
    available: true,
  },
  {
    slug: "neem-turmeric-soap",
    name: "Neem & Turmeric Soap",
    category: "Soap",
    shortDescription:
      "A cold-processed bar with neem leaf and a touch of turmeric.",
    description:
      "Made by hand in small slabs and cut after a six-week cure. The base is a simple blend of coconut and olive oil, with neem powder and turmeric for their traditional skin benefits.\n\nNo palm oil, no synthetic colour, no shimmer.",
    highlights: [
      "Cold-processed and cured for six weeks",
      "Coconut and olive oil base",
      "Real neem leaf and turmeric",
      "Palm-oil free, plastic-free",
    ],
    ingredients:
      "Coconut oil, olive oil, castor oil, neem powder, turmeric, essential oil.",
    howToUse: "Keep the bar dry between uses so it lasts longer.",
    images: [image("soap.jpg")],
    variants: [
      { id: "soap-100g", label: "Single bar · 100 g", price: 199, mrp: 249, stock: 80, active: true },
      {
        id: "soap-pack3",
        label: "Pack of 3",
        price: 549,
        mrp: 699,
        stock: 40,
        active: true,
        offer: { type: "fixed", value: 50, label: "Bundle saving" },
      },
    ],
    offer: null,
    featured: true,
    available: true,
  },
  {
    slug: "rose-sandalwood-soap",
    name: "Rose & Sandalwood Soap",
    category: "Soap",
    shortDescription:
      "A gentle, rose-scented bar for everyday bathing.",
    description:
      "Rose petals are infused into the oils before saponification, and a little sandalwood powder is added for its soft, woody note. The bar is mild enough for daily use and leaves no tight feeling.\n\nThe colour comes from the rose infusion alone.",
    highlights: [
      "Infused with real rose petals",
      "Mild enough for daily use",
      "Sandalwood for a soft, woody note",
      "No synthetic colour or fragrance",
    ],
    ingredients:
      "Coconut oil, olive oil, rice bran oil, rose infusion, sandalwood powder.",
    howToUse: "Lather with water and rinse. Store on a draining soap dish.",
    images: [image("soap.jpg")],
    variants: [
      { id: "rose-100g", label: "Single bar · 100 g", price: 219, mrp: 249, stock: 0, active: true },
      { id: "rose-pack3", label: "Pack of 3", price: 599, mrp: 699, stock: 26, active: true },
    ],
    offer: { type: "percentage", value: 5 },
    featured: false,
    available: true,
  },
];

export const seedServices: ServiceInput[] = [
  {
    slug: "monthly-pantry-subscription",
    name: "Monthly Pantry Subscription",
    tagline:
      "Ghee, honey and a rotating herbal essential, delivered at the start of every month.",
    description:
      "A simple way to keep the pantry stocked without thinking about it. Each month we pack one jar of A2 ghee, one bottle of raw honey and one rotating herbal essential — hair oil, face powder or soap depending on the season.\n\nYou can pause, skip or change the plan at any time by writing to us. There is no lock-in and no automatic card charge — we send a payment link a few days before dispatch.\n\nSubscribers also get first access to limited harvests and experimental batches.",
    highlights: [
      "Ghee, honey and one rotating herbal essential",
      "Free delivery anywhere in India",
      "Pause or skip whenever you need",
      "First access to limited harvests",
    ],
    images: [image("gheehome.jpg"), image("planthome.jpg")],
    priceNote: "From ₹1,499 / month",
    active: true,
    sort: 1,
  },
  {
    slug: "corporate-gifting",
    name: "Corporate & Festive Gifting",
    tagline:
      "Thoughtful hampers for teams, clients and festivals, packed by hand.",
    description:
      "We build small-batch hampers for companies who would rather give something useful than another branded mug. Choose from ghee, honey, soaps and herbal care, and we will help you put together a combination that fits your budget.\n\nEvery hamper is packed by the same team that makes the products, with a handwritten note if you would like one. We can ship to multiple addresses across India and share a consolidated invoice.\n\nMinimum order: 20 hampers. Please write to us at least three weeks before your delivery date.",
    highlights: [
      "Custom combinations and budgets",
      "Handwritten notes on request",
      "Multi-address shipping across India",
      "Consolidated invoicing for companies",
    ],
    images: [image("banner.jpg"), image("herbalbanner.jpg")],
    priceNote: "Minimum 20 hampers",
    active: true,
    sort: 2,
  },
  {
    slug: "ayurvedic-consultation",
    name: "Ayurvedic Wellness Consultation",
    tagline:
      "A slow, unhurried conversation about food, sleep and everyday health.",
    description:
      "A 45-minute online consultation with our consulting vaidya, focused on practical changes rather than a long list of supplements. We will talk through your routine, digestion, sleep and energy, and put together a simple plan you can actually follow.\n\nYou will receive a written summary within two days, including food suggestions and any Gaudham products that fit. This is complementary support, not a replacement for medical treatment.\n\nConsultations are available in English and Hindi.",
    highlights: [
      "45-minute online session",
      "Written summary within two days",
      "Practical food and routine suggestions",
      "Available in English and Hindi",
    ],
    images: [image("aboutus.jpg"), image("conus.jpg")],
    priceNote: "₹899 per session",
    active: true,
    sort: 3,
  },
  {
    slug: "farm-visit",
    name: "A Morning at the Farm",
    tagline:
      "See the herd, walk the herb garden and churn butter with us.",
    description:
      "We open the farm to a small group of visitors once a month. You will meet the cows, walk through the herb garden, see how ghee is cultured and churned, and sit down to a simple farm breakfast.\n\nGroups are kept to twelve people so there is time for questions. Children are welcome. Visits run from 8:00 am to 11:00 am and are confirmed by email a week in advance.\n\nFarm visits are by appointment only and subject to weather.",
    highlights: [
      "Small groups of twelve or fewer",
      "Meet the herd and walk the herb garden",
      "See ghee being cultured and churned",
      "Simple farm breakfast included",
    ],
    images: [image("aboutus.jpg"), image("gheehome.jpg")],
    priceNote: "₹650 per person",
    active: true,
    sort: 4,
  },
];

export const seedCoupons: Array<
  Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount">
> = [
  {
    code: "WELCOME10",
    description: "10% off your first order, up to ₹150.",
    type: "percentage",
    value: 10,
    minOrderValue: 499,
    maxDiscount: 150,
    usageLimit: null,
    active: true,
  },
  {
    code: "GAUDHAM200",
    description: "₹200 off orders above ₹1,499.",
    type: "fixed",
    value: 200,
    minOrderValue: 1499,
    maxDiscount: null,
    usageLimit: null,
    active: true,
  },
];
