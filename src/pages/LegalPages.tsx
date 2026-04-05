import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LegalPage({ title, content }: { title: string; content: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-foreground hover:text-neon-blue"
        >
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-3xl font-bold neon-text-blue">{title}</h1>
      </div>

      <div className="prose prose-invert max-w-none bg-muted/30 p-8 rounded-2xl border border-border/50">
        {content}
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalPage 
      title="Privacy Policy" 
      content={
        <div className="space-y-6 text-muted-foreground">
          <p>Last updated: February 28, 2026</p>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, subscribe to our premium service, or contact us for support. This may include your name, email address, and payment information.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you about your account and our features.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Data Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
          </section>
        </div>
      } 
    />
  );
}

export function TermsOfService() {
  return (
    <LegalPage 
      title="Terms of Service" 
      content={
        <div className="space-y-6 text-muted-foreground">
          <p>Last updated: February 28, 2026</p>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using NeonStream, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. Subscription and Payments</h2>
            <p>Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis. Billing cycles are set on a monthly or annual basis.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Content and Copyright</h2>
            <p>All music, images, and text provided through NeonStream are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.</p>
          </section>
        </div>
      } 
    />
  );
}
