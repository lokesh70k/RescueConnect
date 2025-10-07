import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";

// --- Main Page Component ---
export default function HomePage() {
  return (
    <>
      <Head>
        <title>RescueConnect - Rapid Emergency Response</title>
        <meta name="description" content="Connecting you to emergency services in real-time." />
      </Head>
      <div className="bg-slate-900 text-white">
        <Header />
        <main>
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
        </main>
        <Footer />
      </div>
    </>
  );
}

// --- Header Component ---
const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-20">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex-shrink-0">
        <Link href="/" title="RescueConnect Home" className="flex items-center gap-3">
          {/* ✅ FIX: Pointing to the new high-contrast SVG logo */}
          <img className="w-auto h-12" src="/images/r1.png" alt="RescueConnect Logo" />
        </Link>
      </div>
      <nav className="hidden lg:flex items-center space-x-8">
        <Link href="/loginp" className="text-base font-medium text-gray-300 hover:text-white transition-colors">Police</Link>
        <Link href="/loginf" className="text-base font-medium text-gray-300 hover:text-white transition-colors">Fire Force</Link>
        <Link href="/logina" className="text-base font-medium text-gray-300 hover:text-white transition-colors">Ambulance</Link>
      </nav>
      <div className="hidden lg:flex items-center space-x-4">
        <Link href="/login" className="text-base font-medium text-gray-300 hover:text-white transition-colors">Log In</Link>
        <Link href="/distressForm" className="inline-flex items-center justify-center px-6 py-2.5 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all">
          Report Incident
        </Link>
      </div>
    </div>
  </header>
);

// --- Hero Section with Interactive Map ---
const HeroSection = () => (
  <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
    <div className="absolute inset-0 z-0">
      <LandingPageMap />
      <div className="absolute inset-0 bg-slate-900 bg-opacity-70"></div>
    </div>
    <div className="relative z-10 px-6">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
        Connecting Help, Instantly.
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
        RescueConnect is your direct line to emergency services. Report incidents with precise location data and get the right help, right away.
      </p>
      <div className="mt-10">
        <Link href="/distressForm" className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-all">
          Report an Emergency
        </Link>
      </div>
    </div>
  </section>
);

// --- "How It Works" Section ---
const HowItWorksSection = () => (
  <section className="py-20 bg-slate-800">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-3xl font-bold">How It Works</h2>
      <div className="mt-12 grid md:grid-cols-3 gap-12">
        <div className="flex flex-col items-center">
          <div className="text-blue-400 text-5xl font-bold">1</div>
          <h3 className="mt-4 text-xl font-semibold">Report Incident</h3>
          <p className="mt-2 text-gray-400">Quickly submit an incident report with your exact location and critical details.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-blue-400 text-5xl font-bold">2</div>
          <h3 className="mt-4 text-xl font-semibold">Instantly Connect</h3>
          <p className="mt-2 text-gray-400">Your report is instantly dispatched to the nearest police, fire, and ambulance services.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-blue-400 text-5xl font-bold">3</div>
          <h3 className="mt-4 text-xl font-semibold">Get Help Fast</h3>
          <p className="mt-2 text-gray-400">Real-time tracking and communication ensures help arrives at the right place, fast.</p>
        </div>
      </div>
    </div>
  </section>
);

// --- Features Section ---
const FeaturesSection = () => (
    <section className="py-20">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold">Key Features</h2>
            {/* Add feature details here */}
        </div>
    </section>
);

// --- Footer Component ---
const Footer = () => (
  <footer className="py-12 bg-slate-800 border-t border-slate-700">
    <div className="container mx-auto px-6 text-center">
      <p className="text-gray-400">&copy; {new Date().getFullYear()} RescueConnect. All rights reserved.</p>
    </div>
  </footer>
);

// --- Simple Map for the Landing Page Background ---
const LandingPageMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("Mapbox Access Token is not set!");
      return;
    }
    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [78.9629, 20.5937], // Centered on India
      zoom: 3.5,
      interactive: false,
      attributionControl: false,
    });
  }, []);

  return <div ref={mapContainer} className="absolute inset-0"></div>;
};
