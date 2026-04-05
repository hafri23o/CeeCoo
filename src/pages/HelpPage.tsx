import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const faqs = [
    {
      question: "How do I download music for offline listening?",
      answer: "Currently, NeonStream is a streaming-only service. Offline downloads are a feature we're planning for future updates for our Premium subscribers."
    },
    {
      question: "Can I use NeonStream on multiple devices?",
      answer: "Yes! You can sign in to your NeonStream account on any supported device. However, simultaneous streaming is limited based on your subscription plan."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "Go to Settings > Subscription to manage or cancel your plan at any time. Your benefits will continue until the end of the current billing period."
    },
    {
      question: "How can I upload my own music?",
      answer: "NeonStream currently features curated content from our partners. We're working on a 'Creator Studio' that will allow independent artists to upload directly."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We've received your inquiry and will get back to you soon.",
    });
  };

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
        <h1 className="text-3xl font-bold neon-text-blue">Help & Support</h1>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-blue rounded-full" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-muted/30 p-6 rounded-2xl border border-border/50">
              <h3 className="text-lg font-bold mb-2 text-foreground">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-blue rounded-full" />
          Contact Support
        </h2>
        <form onSubmit={handleSubmit} className="bg-muted/30 p-8 rounded-2xl border border-border/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="your@email.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="How can we help?" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea placeholder="Describe your issue in detail..." className="min-h-[150px]" required />
          </div>
          <Button type="submit" className="w-full md:w-auto gap-2">
            <Send size={18} />
            Send Message
          </Button>
        </form>
      </section>
    </div>
  );
}
