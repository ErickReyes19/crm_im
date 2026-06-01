import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection, { Footer } from "@/components/landing/CTASection";
import "../globals-landing.css";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/profile");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <BenefitsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
