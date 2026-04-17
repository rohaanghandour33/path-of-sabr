import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import Hero from './components/Hero';
import DeenVerses from './components/DeenVerses';
import Features from './components/Features';
import SocialProof from './components/SocialProof';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import './index.css';

export default function App() {
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
