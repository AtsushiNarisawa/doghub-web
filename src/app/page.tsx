import { Header } from "@/components/Header";
import { Hero } from "@/components/hero";
import { Concept } from "@/components/concept";
import { DogHotel } from "@/components/dog-hotel";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";
import { TrustSignals } from "@/components/trust-signals";
import { ModelCase } from "@/components/model-case";
import { CafeGoods } from "@/components/cafe-goods";
import { PhotoGallery } from "@/components/photo-gallery";
import { News } from "@/components/news";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <Hero />
        <Concept />
        <DogHotel />
        <Pricing />
        <Testimonials />
        <TrustSignals />
        <ModelCase />
        <CafeGoods />
        <PhotoGallery />
        <News />
        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
