# 🛒 E-Commerce Platform (Walmart-Inspired)

A full-stack, enterprise-grade e-commerce web application built using the MERN stack. Inspired by Walmart's robust UI and seamless shopping experience, this project features a comprehensive user shopping flow and a powerful admin dashboard for store management. 

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js** - UI Library
- **React Router** - Client-side routing
- **Context API / Redux** - State management
- **Axios** - HTTP client

**Backend:**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB & Mongoose** - NoSQL database & ODM
- **Multer** - File uploading middleware (for product images)
- **JWT (JSON Web Tokens)** - Authentication

---

## ✨ Features

### 👤 User Features
- **Authentication**: Secure login and registration system.
- **Product Discovery**: Browse products with detailed views.
- **Shopping Cart**: Add, remove, and update item quantities in the cart.
- **Order Placement**: Seamless checkout process resulting in order creation.
- **Responsive Design**: Optimized for different screen sizes.

### 🛡️ Admin Features
- **Admin Dashboard**: Centralized view of store metrics and incoming orders.
- **User Management**: View and manage registered users.
- **Product Management**: 
  - Add new products with image uploads (via Multer).
  - Edit existing product details and pricing.
  - Delete products from the catalog.
- **Order Management**: Track and update the status of user orders.

---

## 🏗️ System Architecture & Workflow

1. **Client-Server Communication**: The React frontend communicates with the Express backend via RESTful APIs using Axios. Data is exchanged in JSON format.
2. **Shopping Flow**:
   - **Cart**: Users add items to their cart (managed via state and LocalStorage).
   - **Checkout**: Users proceed to checkout, verifying their items and total prices.
   - **Order**: Upon confirmation, the frontend sends a `POST` request to the backend `/api/orders` endpoint, which securely stores the order in MongoDB and clears the cart.

---

## 🗂️ Folder Structure

```text
/
├── Frontend/               # React Frontend
│   ├── public/
│   └── src/
│       ├── components/   # Reusable UI components (Navbar, ProductCard, etc.)
│       ├── pages/        # Route pages (Home, Cart, Checkout, AdminDashboard)
│       ├── context/      # Global state management
│       ├── services/     # API call configurations
│       ├── assets/       # Static files (images, icons)
│       └── App.js        # Main React entry point
│
└── server/               # Node.js/Express Backend
    ├── config/           # Database and Multer configurations
    ├── controllers/      # Business logic for routes
    ├── models/           # Mongoose schemas (User, Product, Order)
    ├── routes/           # Express API endpoints
    ├── middleware/       # Custom middleware (Auth, Error handling)
    ├── uploads/          # Stored product images (managed by Multer)
    └── server.js         # Backend entry point
```

---

## 📂 File & Folder Explanation

### Backend (`/server`)
- **`controllers/`**: Contains the core business logic. For example, `productController.js` handles fetching, creating, or deleting products.
- **`models/`**: Defines the MongoDB schemas. `Product.js` outlines fields like name, price, and image URL.
- **`routes/`**: Defines the API endpoints and maps them to the respective controllers.
- **`config/multer.js`**: Handles the configuration for image uploading, storing incoming product images safely in the `/uploads` directory.

### Frontend (`/Frontend`)
- **`components/`**: Modular, reusable pieces of the UI such as the shopping cart widget or navigation bar.
- **`pages/`**: Full views corresponding to routes, like the Admin Panel or Checkout page.
- **`services/`**: Centralized Axios API calls to keep components clean.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB installed and running (or a MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup
```bash
cd server
npm install
```
- Create a `.env` file in the `/server` directory (see Environment Variables section).
- Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd Frontend
npm install
npm start
```

The application should now be running locally. Frontend usually on `http://localhost:3000` and Backend on `http://localhost:5000`.

---

## 🔐 Environment Variables

Create a `.env` file inside the `/server` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

---

## 📡 API Overview

Here are a few sample endpoints available in the backend:

**Products**
- `GET /api/products` - Fetch all products
- `POST /api/products` - Add a new product (Admin only, supports `multipart/form-data` for Multer)
- `DELETE /api/products/:id` - Delete a product (Admin only)

**Users**
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate and get JWT
- `GET /api/users` - Get all users (Admin only)

**Orders**
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details

---

## ⚙️ How It Works (Core Flow)

1. **Product Fetching**: When a user visits the homepage, React's `useEffect` hook triggers an Axios `GET` request to `/api/products`. The backend queries MongoDB and returns the products array, which React maps into the UI.
2. **Add to Cart**: Clicking "Add to Cart" updates the global React state (or Context). The cart array updates dynamically, increasing quantities if the item already exists.
3. **Checkout & Order Creation**: On the checkout page, the user confirms their cart. Submitting the checkout form fires a `POST` request to `/api/orders` with the cart items and user details. The backend calculates the final total, verifies stock, saves the `Order` document to MongoDB, and responds with a success status.

---

## 📸 Screenshots

*(Add your screenshots here)*

- **Home Page**: `![Home Page](./screenshots/home.png)`
- **Admin Dashboard**: `![Admin Dashboard](./screenshots/admin.png)`
- **Shopping Cart & Checkout**: `![Checkout](./screenshots/checkout.png)`

---

## 🔮 Future Enhancements

- **Payment Gateway Integration**: Integrate Stripe or PayPal for real money transactions securely.
- **Enhanced JWT Authentication**: Implement refresh tokens and stricter role-based access control guards.
- **Deployment**: Containerize with Docker and deploy the backend to Render/Heroku and the frontend to Vercel/Netlify.
- **Advanced Analytics**: Bring in specialized visualization libraries for the Admin dashboard.

---

## 💡 Conclusion

This project serves as a comprehensive demonstration of full-stack capabilities, bridging a dynamic React frontend with a robust Node.js/MongoDB backend. It emphasizes clean architecture, secure data flow, and scalable design patterns that emulate real-world, enterprise-level e-commerce platforms. 

---
*Created by [Prakyath M] - Feel free to reach out or contribute!*
