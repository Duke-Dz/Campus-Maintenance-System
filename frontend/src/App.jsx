import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/Common/LandingPage";
import Login from "./components/Common/Login";
import Signup from "./components/Common/Signup";
import ForgotPassword from "./components/Common/ForgotPassword";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import ScrollToTop from "./components/Common/ScrollToTop";
import NotFound from "./components/Common/NotFound";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
