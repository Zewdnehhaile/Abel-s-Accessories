import { Product, RepairRequest, Log, RepairStatus, UserRole, User, SalesStat } from './types';

// Path to the image you uploaded to the public folder
export const PROFILE_IMAGE = '/public/abel_profile.jpg';

// Fallback image (Professional placeholder) in case the local image fails to load
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop'; 

export const USERS: User[] = [
  { id: 'u1', name: 'Super Admin', email: 'nehhzewdd@gmail.com', role: UserRole.SUPER_ADMIN, password: 'nehzewd0988' },
  { id: 'u2', name: 'Abel', email: 'abel@abel.com', role: UserRole.SHOP_ADMIN, avatar: PROFILE_IMAGE, password: 'abelpassword' },
  { id: 'u3', name: 'Customer', email: 'user@gmail.com', role: UserRole.CUSTOMER, password: 'userpassword' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 185000,
    stock: 12,
    description: 'The ultimate iPhone with Titanium design, A17 Pro chip, and the most advanced camera system.',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 165000,
    stock: 8,
    description: 'Galaxy AI is here. Titanium frame, flat 6.8" display, and the best zoom on a smartphone.',
    image: 'https://images.unsplash.com/photo-1707231458055-32e67a0709f9?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p3',
    name: 'Google Pixel 8 Pro',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 110000,
    stock: 5,
    description: 'The AI-first phone from Google. Super Actua display and thermometer sensor.',
    image: 'https://images.unsplash.com/photo-1696446700406-896841f4d1e2?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p4',
    name: 'iPhone 13 (Refurbished)',
    category: 'Phone',
    modelType: 'phone',
    condition: 'used',
    price: 65000,
    stock: 3,
    description: 'Certified pre-owned iPhone 13. Excellent condition with new battery.',
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 90,
    status: 'available'
  },
  {
    id: 'p5',
    name: 'Tecno Spark 10 Pro',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 18500,
    stock: 15,
    description: 'Glow as you are. 32MP Glowing Selfie, Hard-wearing Starry Glass.',
    image: 'https://images.unsplash.com/photo-1598965402089-997ce4410e3b?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p8',
    name: 'Infinix Note 30',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 16800,
    stock: 10,
    description: 'Fast charging, sleek design, and a powerful processor for gaming and productivity.',
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p9',
    name: 'Redmi Note 12',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 14500,
    stock: 22,
    description: 'Super AMOLED display with 120Hz refresh rate. Power efficient Snapdragon 685.',
    image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p10',
    name: 'Itel P40',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 9200,
    stock: 25,
    description: 'Big battery, big screen. The most affordable reliability you can find.',
    image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p11',
    name: 'Oppo Reno 10',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 38000,
    stock: 6,
    description: 'The portrait expert. Professional photography features in your pocket.',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p6',
    name: 'Nokia 105 (Brick Phone)',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 2400,
    stock: 40,
    description: 'Classic durable button phone with long-lasting battery and compact design.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'p7',
    name: 'Tecno T301',
    category: 'Phone',
    modelType: 'phone',
    condition: 'new',
    price: 1900,
    stock: 30,
    description: 'Reliable feature phone from Tecno. Dual SIM support and torchlight.',
    image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 365,
    status: 'available'
  },
  {
    id: 'a1',
    name: 'Anker 737 Power Bank',
    category: 'Charger',
    modelType: 'phone',
    condition: 'new',
    price: 12500,
    stock: 20,
    description: '24,000mAh 3-port portable charger with 140W output.',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 180,
    status: 'available'
  },
  {
    id: 'a2',
    name: 'MagSafe Clear Case',
    category: 'Case',
    modelType: 'phone',
    condition: 'new',
    price: 2500,
    stock: 50,
    description: 'Thin, light, and easy to grip.',
    image: 'https://images.unsplash.com/photo-1603351154351-5cf99bc32f2d?q=80&w=800&auto=format&fit=crop',
    warrantyDays: 0,
    status: 'available'
  }
];

export const MOCK_REPAIRS: RepairRequest[] = [
  {
    id: 'r1',
    trackingCode: 'R-8821',
    customerName: 'Dawit Kebede',
    phone: '+251911234567',
    deviceModel: 'Samsung S21',
    issueDescription: 'Screen cracked',
    serviceType: 'screen_repair',
    estimatedCost: 4500,
    paymentStatus: 'cash',
    repairStatus: RepairStatus.IN_PROGRESS,
    createdAt: '2023-10-25'
  }
];

export const MOCK_LOGS: Log[] = [
  { id: 'l1', action: 'Failed Login Attempt', description: 'Invalid password entered', user: 'IP: 192.168.1.1', timestamp: '2023-10-27 10:00 AM', type: 'security' },
];

export const MOCK_SALES_STATS: SalesStat[] = [
  { date: 'Mon', amount: 12000 },
  { date: 'Tue', amount: 19000 },
  { date: 'Wed', amount: 15000 },
  { date: 'Thu', amount: 22000 },
  { date: 'Fri', amount: 35000 },
  { date: 'Sat', amount: 45000 },
  { date: 'Sun', amount: 38000 },
];

export const I18N = {
  en: {
    heroTitle: "Dessie’s Trusted Mobile Hub",
    heroSubtitle: "Premium Accessories. Expert Repairs.",
    heroDescription: "Fast, reliable, and affordable mobile solutions — all in one place.",
    shopNow: 'Shop Now',
    repairService: 'Repair Service',
    meetAbel: 'Meet Abel',
    abelRole: 'Owner & Lead Technician',
    abelBio: 'With years of specialized experience in mobile electronics, Abel brings passion and precision to every restoration. Having established a legacy of trust in Dessie, he prioritizes quality parts.',
    shopTitle: 'Abel Store',
    shopSubtitle: 'Find the perfect add-ons for your device.',
    searchPlaceholder: 'Search products...',
    addToCart: 'Add',
    outOfStock: 'Out of Stock',
    filterAll: 'All',
    filterPhone: 'Phones',
    filterTablet: 'Tablets',
    filterPC: 'PC',
    filterDesktop: 'Desktop',
    cartTitle: 'Your Cart',
    total: 'Total',
    checkout: 'Checkout with Chapa',
    cartEmpty: 'Your cart is empty.',
    home: 'Home',
    shop: 'Store',
    repairs: 'Repairs',
    track: 'Track',
    login: 'Login',
    dashboard: 'Dashboard',
    logout: 'Logout'
  },
  am: {
    heroTitle: "የደሴ የታመነ የሞባይል ማዕከል",
    heroSubtitle: "ምርጥ መለዋወጫዎች። የባለሙያ ጥገና።",
    heroDescription: "ፈጣን፣ አስተማማኝ እና ተመጣጣኝ የሞባይል መፍትሄዎች — በአንድ ቦታ።",
    shopNow: 'አሁን ይግዙ',
    repairService: 'የጥገና አገልግሎት',
    meetAbel: 'አቤልን ይወቁ',
    abelRole: 'ባለቤት እና ዋና ቴክኒሽያን',
    abelBio: 'በሞባይል ኤሌክትሮኒክስ ከ5 ዓመታት በላይ ልምድ ያለው አቤል ለእያንዳንዱ ጥገና ትኩረት እና ጥራት ይሰጣል። በደሴ የታመነ ስም ነው።',
    shopTitle: 'አቤል መደብር',
    shopSubtitle: 'ለመሳሪያዎ ተስማሚ የሆነውን ያግኙ።',
    searchPlaceholder: 'ምርቶችን ይፈልጉ...',
    addToCart: 'ጨምር',
    outOfStock: 'አልቋል',
    filterAll: 'ሁሉም',
    filterPhone: 'ስልኮች',
    filterTablet: 'ታብሌት',
    filterPC: 'ፒሲ',
    filterDesktop: 'ዴስክቶፕ',
    cartTitle: 'የእርስዎ ቅርጫት',
    total: 'ጠቅላላ',
    checkout: 'በChapa ይክፈሉ',
    cartEmpty: 'ቅርጫትዎ ባዶ ነው።',
    home: 'መነሻ',
    shop: 'መደብር',
    repairs: 'ጥገና',
    track: 'ይከታተሉ',
    login: 'ይግቡ',
    dashboard: 'ዳሽቦርድ',
    logout: 'ውጣ'
  }
};
