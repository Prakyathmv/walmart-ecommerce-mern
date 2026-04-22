# 🛒 E-Commerce Platform (Walmart-Inspired)

A full-stack, enterprise-grade e-commerce web application built using the **MERN stack**. Inspired by Walmart's robust UI and seamless shopping experience, this project features a comprehensive user shopping flow, OTP-based authentication, Stripe payment integration, Cloudinary image hosting, and a powerful admin dashboard with analytics.

---

## 🛠️ Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| **React 19** | UI Library |
| **Vite 8** | Build tool & dev server |
| **React Router DOM v6** | Client-side routing |
| **Axios** | HTTP client |
| **React Icons** | Icon library |
| **React Slick** | Image carousel |
| **Recharts** | Admin analytics charts |
| **Context API** | Global state management |

### Backend
| Library | Purpose |
|---|---|
| **Node.js + Express 4** | Runtime & web framework |
| **MongoDB + Mongoose** | NoSQL database & ODM |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **Cloudinary + multer-storage-cloudinary** | Cloud image storage |
| **Multer** | File upload middleware |
| **Stripe** | Payment processing |
| **Resend** | OTP email delivery |
| **helmet** | HTTP security headers |
| **express-rate-limit** | API rate limiting |
| **express-validator** | Input validation |
| **cookie-parser** | Cookie handling |
| **winston** | Structured logging |
| **pdfkit** | PDF invoice generation |
| **nodemon** | Dev server with hot reload |

---

## ✨ Features

### 👤 User Features
- **OTP-Based Authentication**: Secure email OTP login via Resend API; traditional register/login also supported.
- **Product Discovery**: Browse products by category, with a hero grid, carousel, and category grid on the homepage.
- **Product Search**: Full search page with keyword-based filtering.
- **Product Details**: Dedicated product detail page with image, description, price, and stock.
- **Shopping Cart**: Add, remove, and update item quantities; persisted with Context API.
- **Checkout**: Full checkout flow with address form, order summary, and integrated Stripe payment.
- **Order Confirmation**: Post-checkout order confirmation page with order details.
- **Feedback System**: Interactive feedback/rating modal accessible from the footer.
- **Responsive Design**: Optimized for desktop and mobile screen sizes.

### 🛡️ Admin Features
- **Admin Login**: Separate, protected admin authentication flow.  
- **Analytics Dashboard**: Visual charts (Recharts) for sales, revenue, and order metrics.
- **User Management**: View and manage all registered users.
- **Product Management**:
  - Add new products with image upload (stored on Cloudinary).
  - Edit existing product details and pricing.
  - Delete products from the catalog.
- **Order Management**: Track and update order statuses; generate PDF invoices (PDFKit).

---

## 🏗️ System Architecture

```
Browser (React + Vite)
       │
       │  REST API (JSON)
       ▼
Express.js Server (Node.js)
  ├── helmet (security) → rate limiting → CORS → cookie-parser
  ├── /api/auth      → JWT + OTP authentication
  ├── /api/products  → CRUD + Cloudinary image upload
  ├── /api/orders    → Order lifecycle + PDF invoice
  ├── /api/payments  → Stripe payment intent
  └── /api/feedback  → User feedback collection
       │
       ▼
MongoDB Atlas (Mongoose ODM)
  ├── Users
  ├── Products
  ├── Orders
  ├── Otp
  └── Feedback
```

---

## 🗂️ Folder Structure

```text
/
├── Frontend/                  # React + Vite Frontend
│   └── src/
│       ├── admin/             # Admin-only pages & components
│       │   ├── pages/         # AdminDashboard, Dashboard, ManageOrders,
│       │   │                  # ManageProducts, ManageUsers, AdminLogin
│       │   └── components/    # Admin-specific UI components
│       ├── components/        # Shared UI (Navbar, Footer, Carousel,
│       │                      # CategoryGrid, HeroGrid, FeedbackModal,
│       │                      # ProductList, AddProduct, PrivateRoute)
│       ├── pages/             # User pages (Home, Login, Register,
│       │                      # Cart, Checkout, OrderConfirmation,
│       │                      # ProductDetails, Search)
│       ├── context/           # Global state (Cart, Auth contexts)
│       ├── Data/              # Static/seed data files
│       └── utils/             # Helper utilities
│
└── server/                    # Node.js/Express Backend
    ├── models/                # Mongoose Schemas
    │   ├── User.js            # User (hashed password, role)
    │   ├── Product.js         # Product (name, price, cloudinary URL, stock)
    │   ├── Order.js           # Order (items, total, status)
    │   ├── Otp.js             # OTP token storage
    │   └── Feedback.js        # User feedback/ratings
    ├── routes/                # Express API Endpoints
    │   ├── auth.js            # Register, login, OTP flow
    │   ├── products.js        # Product CRUD + image upload
    │   ├── orders.js          # Order management + invoices
    │   ├── payments.js        # Stripe payment intents
    │   └── feedback.js        # Feedback submission & retrieval
    ├── middleware/            # Auth & error middleware
    ├── utils/                 # Server helpers
    └── index.js               # App entry point (Express setup)
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas URI (or local MongoDB)
- Cloudinary account
- Stripe account
- Resend API key (for OTP emails)

### 1. Clone the repository
```bash
git clone https://github.com/Prakyathmv/walmart-ecommerce-mern.git
cd walmart-ecommerce-mern
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in `/server` (see [Environment Variables](#-environment-variables)).

```bash
npm run dev       # Development (nodemon)
# OR
npm start         # Production
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd Frontend
npm install
npm run dev       # Vite dev server → http://localhost:5173
```

> Backend runs on `http://localhost:3000` by default. Frontend dev server runs on `http://localhost:5173`.

---

## 🔐 Environment Variables

Create a `.env` file inside the `/server` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce

# Auth
JWT_SECRET=your_jwt_secret_key

# Cloudinary (image hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...

# Resend (OTP emails)
RESEND_API_KEY=re_...
```

---

## 📡 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login with email + password | Public |
| POST | `/send-otp` | Send OTP to email | Public |
| POST | `/verify-otp` | Verify OTP and get JWT | Public |
| GET | `/me` | Get current user profile | 🔒 User |
| GET | `/users` | Get all users | 🔒 Admin |

### Products — `/api/products`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Fetch all products | Public |
| GET | `/:id` | Fetch product by ID | Public |
| POST | `/` | Add product (multipart/form-data) | 🔒 Admin |
| PUT | `/:id` | Update product | 🔒 Admin |
| DELETE | `/:id` | Delete product | 🔒 Admin |

### Orders — `/api/orders`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create a new order | 🔒 User |
| GET | `/` | Get all orders | 🔒 Admin |
| GET | `/my` | Get current user's orders | 🔒 User |
| GET | `/:id` | Get order by ID | 🔒 User |
| PUT | `/:id/status` | Update order status | 🔒 Admin |
| GET | `/:id/invoice` | Download PDF invoice | 🔒 User |

### Payments — `/api/payments`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-payment-intent` | Create Stripe payment intent | 🔒 User |

### Feedback — `/api/feedback`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Submit feedback | 🔒 User |
| GET | `/` | Get all feedback | 🔒 Admin |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server & DB status |

---

## ⚙️ Core Workflows

### 🔑 OTP Login Flow
1. User enters email → frontend calls `POST /api/auth/send-otp`.
2. Backend generates OTP, stores it in the `Otp` collection, sends email via **Resend**.
3. User submits OTP → frontend calls `POST /api/auth/verify-otp`.
4. Backend validates OTP, returns JWT stored in an HTTP-only cookie.

### 🖼️ Product Image Upload (Cloudinary)
1. Admin submits product form with image in `multipart/form-data`.
2. **Multer** + **multer-storage-cloudinary** streams image directly to Cloudinary.
3. Cloudinary URL is saved in the `Product` document — no local disk storage needed.

### 💳 Checkout & Payment
1. User reviews cart → confirms checkout.
2. Frontend calls `POST /api/payments/create-payment-intent` to get a Stripe client secret.
3. Stripe.js processes card payment client-side.
4. On success, frontend calls `POST /api/orders` to persist the order in MongoDB.
5. User is redirected to the Order Confirmation page.

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| **Backend** | [Render](https://render.com) (`render.yaml` included) |
| **Frontend** | [Vercel](https://vercel.com) |
| **Database** | MongoDB Atlas |
| **Images** | Cloudinary |

> Set all environment variables in the respective platform dashboards before deploying.

---

## 📂 Key Configuration Files

| File | Purpose |
|------|---------|
| `server/.env` | Backend environment variables |
| `render.yaml` | Render deployment configuration |
| `Frontend/.gitignore` | Git ignore rules for frontend |
| `server/Product-API.postman_collection.json` | Postman collection for API testing |

---

## 📊 Admin Dashboard Highlights

- **Sales Analytics**: Revenue trends and order volume charts powered by **Recharts**.
- **Live Metrics**: Total users, products, orders, and revenue at a glance.
- **Order Management**: Update order statuses (Pending → Processing → Shipped → Delivered).
- **PDF Invoices**: Generate and download order invoices using **PDFKit**.

---

## 🔮 Future Enhancements

- **Product Reviews & Ratings**: Allow users to review purchased products.
- **Wishlist**: Let users save products for later.
- **Real-time Notifications**: WebSocket-based order status updates.
- **Advanced Search & Filters**: Multi-faceted filtering by price range, category, and rating.
- **Refresh Token Rotation**: Enhanced JWT security with sliding session tokens.

---

## 💡 Conclusion

This project demonstrates end-to-end full-stack engineering — from a responsive React frontend with a Walmart-inspired design to a secure, production-ready Node.js/Express backend with Cloudinary media handling, Stripe payments, OTP authentication, structured logging, and cloud deployment on Render + Vercel.

---

*Created by [Prakyath M](https://github.com/Prakyathmv/walmart-ecommerce-mern.git) — Feel free to reach out or contribute!*
