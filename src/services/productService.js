import { isFirebaseConfigured, db } from './firebase';
import { collection, getDocs, doc, setDoc, query, where, limit } from 'firebase/firestore';

// -------------------------------------------------------------
// SEED PRODUCTS DATA
// -------------------------------------------------------------
const SEED_PRODUCTS = [
  // Tablets
  {
    productId: "prod_tab_01",
    name: "Paracetamol 650mg (Dolo)",
    brand: "Dolo-650",
    manufacturer: "Micro Labs Ltd",
    description: "Paracetamol 650 mg tablet is a widely used pain reliever and fever reducer. It helps in relieving headache, toothache, backache, nerve pain, and common cold symptoms.",
    uses: "Relieves fever, mild to moderate pain, headaches, muscle aches.",
    sideEffects: "Nausea, allergic skin reactions (rare), liver injury if overdosed.",
    dosageInfo: "Take 1 tablet every 4-6 hours as needed. Do not exceed 4 tablets in 24 hours.",
    price: 26.50,
    mrp: 32.00,
    category: "Tablets",
    stock: 120,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: true
  },
  {
    productId: "prod_tab_02",
    name: "Cetirizine 10mg (Okacet)",
    brand: "Okacet",
    manufacturer: "Cipla Ltd",
    description: "Cetirizine is an antihistamine tablet that treats symptoms of allergies such as runny nose, sneezing, itchy or watery eyes, and hives.",
    uses: "Allergic rhinitis, seasonal allergies, skin itchiness.",
    sideEffects: "Drowsiness, dry mouth, tiredness, headache.",
    dosageInfo: "1 tablet daily at bedtime or as directed by a doctor.",
    price: 18.00,
    mrp: 24.00,
    category: "Tablets",
    stock: 90,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    isPopular: false,
    isBestSeller: false
  },
  // Capsules
  {
    productId: "prod_cap_01",
    name: "Omeprazole 20mg (Omez)",
    brand: "Omez",
    manufacturer: "Dr. Reddy's Laboratories Ltd",
    description: "Omez capsule is an antacid that reduces the amount of acid produced in your stomach. It helps treat acid reflux, heartburn, and stomach ulcers.",
    uses: "Acidity, heartburn, gastroesophageal reflux disease (GERD), peptic ulcer disease.",
    sideEffects: "Headache, diarrhea, stomach pain, flatulence.",
    dosageInfo: "Take 1 capsule in the morning on an empty stomach, 30 minutes before breakfast.",
    price: 45.00,
    mrp: 58.00,
    category: "Capsules",
    stock: 80,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: false
  },
  {
    productId: "prod_cap_02",
    name: "Amoxicillin 500mg (Novamox)",
    brand: "Novamox 500",
    manufacturer: "Cipla Ltd",
    description: "Novamox is a penicillin-type antibiotic capsule used to treat a wide variety of bacterial infections of the lungs, throat, and urinary tract.",
    uses: "Bacterial infections, bronchitis, tonsillitis, ear infection.",
    sideEffects: "Nausea, diarrhea, skin rash, yeast infection.",
    dosageInfo: "Take 1 capsule three times daily for 5-7 days as prescribed. Complete the full course.",
    price: 88.20,
    mrp: 105.00,
    category: "Capsules",
    stock: 65,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    isPopular: false,
    isBestSeller: true
  },
  // Syrups
  {
    productId: "prod_syr_01",
    name: "Benadryl Cough Formula 100ml",
    brand: "Benadryl",
    manufacturer: "Johnson & Johnson",
    description: "Benadryl Cough Syrup provides quick relief from wet cough, throat irritation, and sneezing by thinning the mucus and soothing the respiratory tract.",
    uses: "Wet cough, chest congestion, throat tickle.",
    sideEffects: "Drowsiness, dizziness, blurred vision.",
    dosageInfo: "Adults: 10ml three times a day. Children: 5ml or as directed by a pediatrician.",
    price: 115.00,
    mrp: 130.00,
    category: "Syrups",
    stock: 110,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: true
  },
  {
    productId: "prod_syr_02",
    name: "Multivitamin Syrup (A to Z) 200ml",
    brand: "A to Z NS",
    manufacturer: "Alkem Laboratories",
    description: "A to Z Multivitamin Syrup is a health supplement enriched with essential minerals, L-lysine, and vitamins that boost energy, immunity, and support active growth.",
    uses: "Nutritional deficiencies, boosting immunity, general weakness, loss of appetite.",
    sideEffects: "Mild stomach upset, metallic taste (rare).",
    dosageInfo: "Take 5ml to 10ml daily after meals, or as directed by your physician.",
    price: 148.00,
    mrp: 175.00,
    category: "Syrups",
    stock: 75,
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60",
    isPopular: false,
    isBestSeller: false
  },
  // Injections
  {
    productId: "prod_inj_01",
    name: "Ceftriaxone 1g Injection (Monocef)",
    brand: "Monocef 1g",
    manufacturer: "Aristo Pharmaceuticals Pvt Ltd",
    description: "Monocef is a highly effective cephalosporin antibiotic injection given intravenously or intramuscularly to treat severe bacterial infections like meningitis, sepsis, and UTI.",
    uses: "Severe bacterial infections, joint infections, meningitis, surgical prophylaxis.",
    sideEffects: "Pain at injection site, diarrhea, changes in white blood cell counts.",
    dosageInfo: "Must be administered by a healthcare professional (doctor/nurse) only.",
    price: 52.00,
    mrp: 61.50,
    category: "Injection",
    stock: 40,
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500&auto=format&fit=crop&q=60",
    isPopular: false,
    isBestSeller: false
  },
  // Diabetes Care
  {
    productId: "prod_dia_01",
    name: "Metformin 500mg (Glycomet)",
    brand: "Glycomet-500",
    manufacturer: "USV Private Ltd",
    description: "Glycomet Metformin tablet is an oral anti-diabetic medicine that helps control blood sugar levels in people with type 2 diabetes mellitus.",
    uses: "Type 2 Diabetes Mellitus, insulin resistance.",
    sideEffects: "Nausea, diarrhea, metallic taste, abdominal bloating.",
    dosageInfo: "Take 1 tablet twice daily with food, or as prescribed by your endocrinologist.",
    price: 24.50,
    mrp: 29.00,
    category: "Diabetes Care",
    stock: 200,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d304b3b86?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: true
  },
  {
    productId: "prod_dia_02",
    name: "Accu-Chek Active Test Strips 50 count",
    brand: "Accu-Chek",
    manufacturer: "Roche Diabetes Care",
    description: "Accu-Chek Active blood glucose monitoring test strips are designed for easy, accurate determination of blood sugar levels using the Accu-Chek Active Glucometer.",
    uses: "Self-monitoring of blood glucose levels.",
    sideEffects: "None.",
    dosageInfo: "Single-use test strip. Follow instructions in user manual.",
    price: 925.00,
    mrp: 1049.00,
    category: "Diabetes Care",
    stock: 45,
    image: "https://images.unsplash.com/photo-1607619056574-7b8d304b3b86?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: true
  },
  // Baby Care
  {
    productId: "prod_baby_01",
    name: "Himalaya Baby Massage Oil 200ml",
    brand: "Himalaya",
    manufacturer: "The Himalaya Drug Company",
    description: "Infused with olive oil and winter cherry, this baby massage oil clinically proven to be mild, nourishing the baby's delicate skin and promoting healthy bone growth.",
    uses: "Nourishes baby skin, improves blood circulation, dry skin prevention.",
    sideEffects: "Extremely rare mild skin allergy (discontinue if redness occurs).",
    dosageInfo: "Apply all over body before bath and massage gently.",
    price: 185.00,
    mrp: 210.00,
    category: "Baby Care",
    stock: 55,
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60",
    isPopular: false,
    isBestSeller: false
  },
  {
    productId: "prod_baby_02",
    name: "Johnson's Baby Powder 400g",
    brand: "Johnson's Baby",
    manufacturer: "Johnson & Johnson",
    description: "Johnson's Baby Powder keeps your baby's skin comfortable, dry, and smelling fresh, acting as a friction protection layer against diaper rash.",
    uses: "Diaper rash protection, skin drying, freshness.",
    sideEffects: "Inhalation hazard (keep away from baby's nose/mouth).",
    dosageInfo: "Sprinkle onto your hands and smooth gently onto baby's clean skin after bath or diaper change.",
    price: 245.00,
    mrp: 275.00,
    category: "Baby Care",
    stock: 60,
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: false
  },
  // Skin Care
  {
    productId: "prod_skin_01",
    name: "Cetaphil Gentle Skin Cleanser 250ml",
    brand: "Cetaphil",
    manufacturer: "Galderma Laboratories",
    description: "A dermatologist-recommended soap-free cleanser that actively hydrates as it cleanses. Ideal for sensitive, dry, or acne-prone skin.",
    uses: "Facial cleansing, skin hydration, sensitive skin care.",
    sideEffects: "None reported.",
    dosageInfo: "Apply to skin and massage gently. Rinse with water or wipe clean with soft tissue.",
    price: 340.00,
    mrp: 399.00,
    category: "Skin Care",
    stock: 50,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: true
  },
  // Personal Care
  {
    productId: "prod_pers_01",
    name: "Dettol Liquid Antiseptic 500ml",
    brand: "Dettol",
    manufacturer: "Reckitt Benckiser",
    description: "Dettol Antiseptic Liquid provides protection against 100 illness-causing germs. Use for wound disinfection, household cleaning, and personal hygiene.",
    uses: "First aid, cuts/scratches, bathing antiseptic, laundry disinfection.",
    sideEffects: "Skin irritation if used undiluted.",
    dosageInfo: "Always dilute before use. Use 1 capful in 1 bucket of water for bathing.",
    price: 215.00,
    mrp: 236.00,
    category: "Personal Care",
    stock: 95,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: true
  },
  // Vitamins
  {
    productId: "prod_vit_01",
    name: "Neurobion Forte (30 Tablets)",
    brand: "Neurobion",
    manufacturer: "Procter & Gamble Health Ltd",
    description: "Neurobion Forte contains Vitamin B Complex (B1, B2, B3, B5, B6, B12). It helps improve nervous system function, boosts metabolism, and strengthens immunity.",
    uses: "Vitamin B deficiency, neuropathy, tiredness, general health booster.",
    sideEffects: "Yellow discoloration of urine (harmless B2 effect).",
    dosageInfo: "Take 1 tablet daily after lunch or as advised by your doctor.",
    price: 38.50,
    mrp: 44.00,
    category: "Vitamins",
    stock: 150,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: true
  },
  {
    productId: "prod_vit_02",
    name: "Vitamin C 500mg Chewable (Limcee)",
    brand: "Limcee",
    manufacturer: "Abbott Healthcare Pvt Ltd",
    description: "Limcee is an orange-flavored Vitamin C chewable tablet. Vitamin C is a strong antioxidant that supports skin health, wound healing, and strengthens overall immunity.",
    uses: "Vitamin C deficiency, immunity booster, scurvy, skin glow.",
    sideEffects: "Stomach upset if taken in excessively large doses.",
    dosageInfo: "Chew 1 tablet daily or as prescribed.",
    price: 23.20,
    mrp: 27.50,
    category: "Vitamins",
    stock: 180,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    isPopular: false,
    isBestSeller: false
  },
  // Healthcare Devices
  {
    productId: "prod_dev_01",
    name: "Omron Hem 7120 Blood Pressure Monitor",
    brand: "Omron",
    manufacturer: "Omron Healthcare",
    description: "Omron HEM-7120 is a compact, fully automatic upper arm blood pressure monitor. It operates on the oscillometric principle for accurate readings and detects irregular heartbeats.",
    uses: "Monitoring systolic and diastolic blood pressure, pulse rate.",
    sideEffects: "None.",
    dosageInfo: "Wrap cuff around left upper arm. Press start button. Sit still during reading.",
    price: 1890.00,
    mrp: 2240.00,
    category: "Healthcare Devices",
    stock: 35,
    image: "https://images.unsplash.com/photo-1557825835-b64a1030c6f2?w=500&auto=format&fit=crop&q=60",
    isPopular: true,
    isBestSeller: false
  },
  {
    productId: "prod_dev_02",
    name: "Digital Thermometer (Dr Trust)",
    brand: "Dr Trust",
    manufacturer: "Dr Trust USA",
    description: "Dr Trust Digital Thermometer provides high precision oral or underarm temperature reading within 60 seconds. Clinically tested, water-resistant, with auto shutoff and fever alarm.",
    uses: "Measuring body temperature.",
    sideEffects: "None.",
    dosageInfo: "Place sensor tip under tongue or armpit. Wait for beep signal.",
    price: 199.00,
    mrp: 249.00,
    category: "Healthcare Devices",
    stock: 75,
    image: "https://images.unsplash.com/photo-1557825835-b64a1030c6f2?w=500&auto=format&fit=crop&q=60",
    isPopular: false,
    isBestSeller: false
  }
];

// Initialize Mock Products in LocalStorage if not present
const getMockProducts = () => {
  const local = localStorage.getItem('littu_mock_products');
  if (!local) {
    localStorage.setItem('littu_mock_products', JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  return JSON.parse(local);
};

// -------------------------------------------------------------
// EXPORTED PRODUCT SERVICE
// -------------------------------------------------------------
export const productService = {
  // 1. Seed Firestore if it is empty (only when Firebase is active)
  seedProductsIfEmpty: async () => {
    if (!isFirebaseConfigured) return;
    try {
      const q = query(collection(db, 'products'), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("Seeding Firestore products collection...");
        for (const prod of SEED_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.productId), prod);
        }
        console.log("Firestore products seeded successfully.");
      }
    } catch (error) {
      console.error("Failed to seed products in Firestore:", error);
    }
  },

  // 2. Fetch Products with Search, Categories, Price Filter, Sorting & Pagination
  getProducts: async ({
    category = '',
    search = '',
    minPrice = 0,
    maxPrice = Infinity,
    sortBy = 'popularity', // popularity, priceLowHigh, priceHighLow
    page = 1,
    limitItems = 8
  } = {}) => {
    let list = [];

    if (isFirebaseConfigured) {
      // In production, we'll fetch from Firestore.
      // To bypass complex index creation for nested multi-parameter filters in Firestore,
      // it is standard practice to fetch the catalog and filter in memory, OR query by category and filter remaining in client.
      // Since it's a customer portal, fetching the collection and filtering in-memory is highly robust.
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        querySnapshot.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id });
        });
      } catch (error) {
        console.error("Error loading products from Firestore, using seed fallback:", error);
        list = [...SEED_PRODUCTS];
      }
    } else {
      list = getMockProducts();
    }

    // Apply Filter: Search
    if (search.trim()) {
      const queryStr = search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(queryStr) || 
        p.brand.toLowerCase().includes(queryStr) ||
        p.category.toLowerCase().includes(queryStr)
      );
    }

    // Apply Filter: Category
    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Apply Filter: Price Range
    list = list.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Apply Sorting
    if (sortBy === 'popularity') {
      // Popular first, then bestsellers
      list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else if (sortBy === 'priceLowHigh') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHighLow') {
      list.sort((a, b) => b.price - a.price);
    }

    // Pagination Calculation
    const totalCount = list.length;
    const startIndex = (page - 1) * limitItems;
    const paginatedItems = list.slice(startIndex, startIndex + limitItems);
    const totalPages = Math.ceil(totalCount / limitItems);

    return {
      products: paginatedItems,
      totalCount,
      totalPages,
      currentPage: page
    };
  },

  // 3. Fetch Single Product Details
  getProductById: async (productId) => {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        let found = null;
        querySnapshot.forEach((doc) => {
          if (doc.data().productId === productId) {
            found = { ...doc.data(), id: doc.id };
          }
        });
        if (found) return found;
        throw new Error("Product not found");
      } catch (e) {
        console.error("Firestore get product error:", e);
      }
    }
    
    // Mock / Local Fallback
    const products = getMockProducts();
    const product = products.find(p => p.productId === productId);
    if (!product) throw new Error("Product not found");
    return product;
  },

  // 4. Get Similar Products
  getSimilarProducts: async (productId, category, limitItems = 4) => {
    let list = [];
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        querySnapshot.forEach((doc) => {
          list.push(doc.data());
        });
      } catch (e) {
        list = [...SEED_PRODUCTS];
      }
    } else {
      list = getMockProducts();
    }
    // Filter out current product, match category, slice
    return list
      .filter(p => p.productId !== productId && p.category.toLowerCase() === category.toLowerCase())
      .slice(0, limitItems);
  }
};
