# Littu Medical Store - Customer Portal

A modern, production-ready, fully responsive Medical Store Customer Portal built with **React.js (Vite)**, **Tailwind CSS v4**, and **Firebase (Auth, Firestore, Storage)**. It mimics popular Indian pharmacy apps such as Apollo Pharmacy, Tata 1mg, and Netmeds.

---

## 🌟 Key Features

1. **User Authentication (Firebase / Local Mock)**
   - Secure email & password signup and login.
   - Comprehensive validations for mobile numbers, passwords, and emails.
   - Stateful simulation of email verification.
   - "Remember Me" session persistence.
   - "Forgot Password" reset link flows.

2. **Medicine Catalog & Filtering**
   - Live search input with debounced auto-suggestions overlay.
   - Clean sidebar categories (Tablets, Capsules, Syrups, Injections, Diabetes Care, Baby Care, Skin Care, Personal Care, Vitamins, Devices).
   - Range-based pricing sliders and category tags.
   - Sorting filters (Popularity, Price Low-High, Price High-Low).
   - Fully paginated product grids with responsive layout cards.

3. **Product Details View**
   - Expanded medicine info cards (brand, manufacturer, detailed description).
   - Multi-column guides for Uses, Possible Side Effects, and Dosage Info.
   - Dynamic quantity controllers checking active stock levels.
   - Wishlist toggling and direct "Buy Now" checkout routes.
   - Category-matched related product recommendations list.

4. **Shopping Cart & Checkout System**
   - Live persistent cart synchronizing with either Firestore or LocalStorage.
   - Real-time billing details: subtotal, MRP savings, flat/free delivery, and promo code discounts.
   - Promo coupon applies (e.g. `LITTU10` for 10% off, `MED20` for 20% off, `FREESHIP` for free shipping).
   - Shipping destination selectors with integrated inline new address creation forms.
   - Multiple payment gateways choices (UPI, Cards, COD).

5. **Order Management & Live Tracking**
   - User order history records list with status trackers.
   - Visual timeline progress stepper: Order Placed ➔ Processing ➔ Packed ➔ Shipped ➔ Out For Delivery ➔ Delivered.
   - **Interactive Status Simulator**: A testing button that cycles through order status steps on mockup orders to preview timeline updates in real-time.

6. **Address Book & Profile Management**
   - Full Address Book (CRUD) where users can add, edit, delete, and toggle default checkout addresses.
   - Profile updating form for Full Name and Phone, alongside a change password form.
   - **Recharts Analytics Dashboard**: Sleek data graphs showing monthly spending history and order volume charts.

---

## 🛠️ Tech Stack

- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS v4, Lucide React (for premium icons)
- **Routing**: React Router DOM v6
- **Database / Auth**: Firebase Web SDK v10+ (Firestore, Authentication, Storage)
- **Analytics Charts**: Recharts
- **HTTP Client**: Axios

---

## 📂 Project Folder Structure

```text
customer-app/ (Root)
├── src/
│   ├── assets/          # Static elements and icons
│   ├── components/      # Reusable functional UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── CartItem.jsx
│   │   ├── SearchBar.jsx
│   │   ├── OrderTracker.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/           # Page layouts and screen containers
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Profile.jsx
│   │   ├── Addresses.jsx
│   │   └── NotFound.jsx
│   ├── context/         # React Context state providers
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── services/        # Service connectors & fallback mockup drivers
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   └── orderService.js
│   ├── index.css        # Global CSS, Google Fonts, and Tailwind v4 themes
│   ├── App.jsx          # Route mappings and context wrappers
│   └── main.jsx         # React application mounting
├── index.html           # HTML wrapper with SEO titles and meta tags
├── vite.config.js       # Vite build configurations with Tailwind plugins
├── .env.example         # Template configuration file for Firebase keys
└── package.json         # Scaffolding dependencies manifest
```

---

## ⚙️ Setup and Installation

### 1. Prerequisite
Ensure you have **Node.js (v18 or higher)** installed on your machine.

### 2. Install Dependencies
Run the command below in the project root to install all required libraries:
```bash
npm install
```

### 3. Firebase Configuration (Optional)
This project is designed to run **out-of-the-box** without Firebase credentials using a stateful LocalStorage-based database mock. To connect your live Firebase instance:
1. Duplicate the `.env.example` file and name the copy `.env`.
2. Replace the placeholder values with your Firebase Web App credentials:
   ```text
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   ...
   ```
3. The application will automatically detect the credentials on reload, seed your Firestore with medicine data, and switch to live Firebase authentication and storage!

### 4. Running the Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open your browser and visit: `http://localhost:5173`.

### 5. Compiling for Production
To bundle and compile the application for production hosting:
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` directory.

---

## 💡 Architecture & Security Highlights

- **Admin/Delivery Portals Compatibility**: The Firestore database structure separates data collections (`users`, `products`, `orders`, `addresses`, `cart`, `wishlist`) by User ID and Product ID, meaning the Admin Panel and Delivery Portal can be integrated in the future without changing the schemas.
- **Client Side Guards**: Protected pages automatically inspect sessions, redirecting unauthenticated users to `/login` and routing them back to their target endpoint on login completion.
- **Fail-Safe Fallbacks**: Our service layer intercepts failures to connect to Firebase and loads mock databases seamlessly, guaranteeing that development and testing are unblocked.
