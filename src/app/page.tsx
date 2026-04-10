import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/hero";
import { Concept } from "@/components/concept";
import { DogHotel } from "@/components/dog-hotel";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";
import { ModelCase } from "@/components/model-case";
import { CafeGoods } from "@/components/cafe-goods";
import { HakoneGuide } from "@/components/hakone-guide";
import { News } from "@/components/news";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { GwBanner } from "@/components/gw-banner";
import { InstagramFollowLight } from "@/components/instagram-follow";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <GwBanner />
        <Hero />
        <Concept />
        <DogHotel />
        <Pricing />
        <Testimonials />
        <ModelCase limit={1} />
        <CafeGoods />
        <HakoneGuide />
        <News />
        <section className="py-8 lg:py-12">
          <div className="max-w-3xl mx-auto px-6">
            <InstagramFollowLight />
          </div>
        </section>
        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
