export const site = {
  name: "Gaudham",
  tagline: "Pure by nature. Made in small batches.",
  description:
    "Gaudham brings you small-batch A2 ghee, raw honey, herbal care and handmade soaps, made with respect for the soil, the animals and the people we feed.",
  email: "hello@gaudham.in",
  phone: "+91 90000 00000",
  phoneHref: "+919000000000",
  whatsapp: "+919000000000",
  address: "Gaudham Farm, Indore, Madhya Pradesh, India",
  hours: "Mon – Sat, 10:00 am – 6:00 pm",
  freeShippingAbove: 999,
  shippingFee: 59,
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  returnsWindow: 7,
};

export const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "About Us", href: "/about" },
];

export const categories = [
  {
    name: "Ghee",
    blurb: "Slow-churned, grass-fed",
    icon: "ghee" as const,
    image: "/assets/images/gheehome.jpg",
  },
  {
    name: "Herbal",
    blurb: "Oils & everyday care",
    icon: "herbal" as const,
    image: "/assets/images/planthome.jpg",
  },
  {
    name: "Honey",
    blurb: "Raw, unfiltered, wild",
    icon: "honey" as const,
    image: "/assets/images/Honey.jpg",
  },
  {
    name: "Soap",
    blurb: "Cold-processed bars",
    icon: "soap" as const,
    image: "/assets/images/soap.jpg",
  },
];

export const assetImages = [
  { label: "Ghee jar", src: "/assets/images/Ghee.jpg" },
  { label: "Ghee lifestyle", src: "/assets/images/gheehome.jpg" },
  { label: "Herbal powder", src: "/assets/images/Herbalpowder.jpg" },
  { label: "Herbal oil", src: "/assets/images/herbaloil.jpg" },
  { label: "Herbal lifestyle", src: "/assets/images/planthome.jpg" },
  { label: "Honey", src: "/assets/images/Honey.jpg" },
  { label: "Soap", src: "/assets/images/soap.jpg" },
  { label: "Hero banner", src: "/assets/images/banner.jpg" },
  { label: "Herbal banner", src: "/assets/images/herbalbanner.jpg" },
  { label: "About / farm", src: "/assets/images/aboutus.jpg" },
  { label: "Contact", src: "/assets/images/conus.jpg" },
];

export const orderStatuses = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
