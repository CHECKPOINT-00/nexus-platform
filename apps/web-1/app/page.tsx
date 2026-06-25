import AppShell from "@/components/layout/AppShell";
import LandingHero from "@/components/landing/LandingHero";
import PackagePreview from "@/components/landing/PackagePreview";
import FAQSection from "@/components/landing/FAQSection";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col w-full min-h-screen">
        <LandingHero />
        <PackagePreview />
        <FAQSection />
      </div>
    </AppShell>
  );
}
