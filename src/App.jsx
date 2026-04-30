import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import Hero from './components/Hero';
import DeenVerses from './components/DeenVerses';
import Features from './components/Features';
import SocialProof from './components/SocialProof';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import './index.css';

function LandingPage() {
  return (
    <div className="min-h-screen">
      <AnnouncementBanner />
      <Navbar />
      <main>
        <Hero />
        <DeenVerses />
        <Features />
        <SocialProof />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
