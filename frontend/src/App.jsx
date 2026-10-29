import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// ==========================================
// CUSTOMER PAGES
// ==========================================

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const About = lazy(() => import("./pages/About"));
const Collections = lazy(() => import("./pages/Collections"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const Orders = lazy(() => import("./pages/orders"));
const Checkout = lazy(() => import("./pages/Checkout"));

// ==========================================
// ADMIN
// ==========================================

const AdminLogin = lazy(() => import("./Admin/pages/AdminLogin"));
import AdminLayout from "./Admin/layouts/AdminLayouts";

const AdminDashboard = lazy(() => import("./Admin/pages/AdminDashboard"));
const Products = lazy(() => import("./Admin/pages/products"));
const AddProduct = lazy(() => import("./Admin/pages/AddProduct"));
const EditProduct = lazy(() => import("./Admin/pages/EditProduct"));
const Categories = lazy(() => import("./Admin/pages/Categories"));
const Customers = lazy(() => import("./Admin/pages/Customer"));
const AdminOrders = lazy(() => import("./Admin/pages/Orders"));
const HomeImages = lazy(() => import("./Admin/pages/HomeImages"));

// ==========================================
// CUSTOMER LAYOUT
// ==========================================

function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// ==========================================
// APP
// ==========================================

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-[#1b4332]">Loading...</div>}>
        <Routes>

          {/* =====================================
              CUSTOMER WEBSITE
          ===================================== */}

          <Route element={<CustomerLayout />}>

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/product/:id"
              element={<ProductDetailsPage />}
            />

            <Route
              path="/shop"
              element={<Shop />}
            />

            <Route
              path="/collections"
              element={<Collections />}
            />

            <Route
              path="/about"
              element={<About />}
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

          </Route>


          {/* =====================================
              ADMIN LOGIN
          ===================================== */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />


          {/* =====================================
              ADMIN PANEL
          ===================================== */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* Dashboard */}

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />


            {/* Products */}

            <Route
              path="products"
              element={<Products />}
            />

            <Route
              path="products/add"
              element={<AddProduct />}
            />

            <Route
              path="products/edit/:id"
              element={<EditProduct />}
            />


            {/* Categories */}

            <Route
              path="categories"
              element={<Categories />}
            />


            {/* Customers */}

            <Route
              path="customers"
              element={<Customers />}
            />


            {/* Orders */}

            <Route
              path="orders"
              element={<AdminOrders />}
            />

            <Route
              path="home-images"
              element={<HomeImages />}
            />

          </Route>

        </Routes>
        </Suspense>

      </AuthProvider>
    </BrowserRouter>
  );
}
