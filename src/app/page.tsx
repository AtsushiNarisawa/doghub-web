import { Header } from "@/components/Header";
import { Hero } from "@/components/hero";
import { Concept } from "@/components/concept";
import { DogHotel } from "@/components/dog-hotel";
import { Pricing } from "@/components/pricing";
import { CafeGoods } from "@/components/cafe-goods";
import { PhotoGallery } from "@/components/photo-gallery";
import { ModelCase } from "@/components/model-case";
import { News } from "@/components/news";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <Hero />
        <Concept />
        <DogHotel />
        <Pricing />
        <CafeGoods />
        <PhotoGallery />
        <ModelCase />
        <News />
        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
