import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import HomePage from "@/pages/HomePage";
import CourseDetail from "@/pages/CourseDetail";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import "@/index.css";

function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course/:key" element={<CourseDetail />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
      </AppProvider>
    </HelmetProvider>
  );
}

export default App;
