import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import Hero from './components/Hero';
import DeenVerses from './components/DeenVerses';
import Features from './components/Features';
import SocialProof from './components/SocialProof';
import Pricing from './components/Pricing';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Companion from './pages/Companion';
import BottomNav from './components/dashboard/BottomNav';
import './index.css';

// Standalone page for the AI Companion route
function CompanionPage() {
  const { user } = useAuth();
  return (
    // Companion manages its own height (100dvh) — no wrapper constraints needed
    <>
      <Companion userId={user?.id} user={user} />
      {/* Bottom nav — mobile only; desktop uses the sidebar for identity/nav */}
      <div className="lg:hidden">
        <BottomNav activeTab="ai" setActiveTab={() => {}} />
      </div>
    </>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen">
      <AnnouncementBanner />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <DeenVerses />
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
          <Route
            path="/companion"
            element={
              <ProtectedRoute>
                <CompanionPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
