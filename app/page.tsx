import HeroSection from "@/components/hero/HeroSection";
import AboutSection from "@/components/about/AboutSection";
import ProcessSection from "@/components/process/ProcessSection";
import WorkSection from "@/components/work/WorkSection";
import SpecialistSection from "@/components/specialist/SpecialistSection";
import TestimonialSection from "@/components/testimonial/TestimonialSection";
import ShortPortfolioSection from "@/components/short-portfolio/ShortPortfolioSection";
import FooterSection from "@/components/footer/FooterSection";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <WorkSection />
      <SpecialistSection />
      <TestimonialSection />
      <ShortPortfolioSection />
      <FooterSection />
    </main>
  );
}
