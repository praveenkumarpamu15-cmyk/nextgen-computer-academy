import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { About, WhyChooseUs, Vision, Contact } from "@/components/Sections";
import Courses from "@/components/Courses";
import Trainer from "@/components/Trainer";
import Testimonials from "@/components/Testimonials";
import SuccessJourney from "@/components/SuccessJourney";
import DemoBooking from "@/components/DemoBooking";
import AdmissionForm from "@/components/AdmissionForm";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import SEO from "@/components/SEO";
import { useApp } from "@/context/AppContext";

export default function HomePage() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="ngca-loader" />
        <p className="mt-4 text-sm text-slate-500 font-medium tracking-wide">Loading NextGen Computer Academy...</p>
      </div>
    );
  }

  return (
    <div data-testid="home-page" className="min-h-screen bg-white">
      <SEO path="/" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Courses />
        <Trainer />
        <DemoBooking />
        <WhyChooseUs />
        <Vision />
        <SuccessJourney />
        <Testimonials />
        <Gallery />
        <AdmissionForm />
        <Contact />
      </main>
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
