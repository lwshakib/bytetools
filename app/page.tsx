"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Globe, 
  Calendar, 
  Key, 
  Clock, 
  Hourglass, 
  QrCode, 
  Timer, 
  ShieldCheck,
  Zap, 
  Shield,
  Activity,
  ArrowRight,
  Github,
  Youtube,
  Instagram,
  Twitter,
  MessageCircle,
  TrendingUp,
  Gamepad2,
  Hash,
  Scale,
  Layout,
  Smartphone,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const tools = [
  { title: "Timezones", url: "/timezones", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Global temporal mapping and conversion." },
  { title: "Daily Planner", url: "/daily-planner", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Simple task management for productivity." },
  { title: "Password Gen", url: "/password-generator", icon: Key, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Secure cryptographic password generation." },
  { title: "Pomodoro", url: "/pomodoro", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Focus cycles for deep work sessions." },
  { title: "Timer", url: "/timer", icon: Hourglass, color: "text-teal-500", bg: "bg-teal-500/10", desc: "Precision intervals for every task." },
  { title: "QR Hub", url: "/qrcode", icon: QrCode, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Encoded data matrix generation." },
  { title: "Stopwatch", url: "/stopwatch", icon: Timer, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Sub-millisecond high-fidelity logs." },
  { title: "JWT Tool", url: "/jwt", icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10", desc: "Analyze and debug token architecture." },
  { title: "Age Calc", url: "/age-calculator", icon: Calendar, color: "text-cyan-500", bg: "bg-cyan-500/10", desc: "Determine precise age and milestones." },
  { title: "BMI Calc", url: "/bmi-calculator", icon: Activity, color: "text-lime-500", bg: "bg-lime-500/10", desc: "Calculate Body Mass Index and health." },
  { title: "Currency", url: "/currency-converter", icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-500/10", desc: "Real-time exchange rate conversions." },
  { title: "RPS Game", url: "/rock-paper-scissors", icon: Gamepad2, color: "text-red-500", bg: "bg-red-500/10", desc: "A classic game to settle debates." },
  { title: "Tic Tac Toe", url: "/tic-tac-toe", icon: Hash, color: "text-sky-500", bg: "bg-sky-500/10", desc: "Standard strategic grid game." },
  { title: "Weight Conv", url: "/weight-converter", icon: Scale, color: "text-violet-500", bg: "bg-violet-500/10", desc: "Seamless unit conversion for weight." },
];

const features = [
  {
    title: "Privacy First",
    desc: "All processing happens locally in your browser. Your data never leaves your device.",
    icon: EyeOff,
  },
  {
    title: "Blazing Fast",
    desc: "Built with Next.js for near-instant load times and zero-latency interactions.",
    icon: Zap,
  },
  {
    title: "No Strings Attached",
    desc: "No ads, no tracking, and no account required. Just pure utility.",
    icon: Shield,
  },
  {
    title: "Truly Responsive",
    desc: "Designed to look and feel great on any device, from mobile to ultra-wide.",
    icon: Smartphone,
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 font-sans">
      {/* Navigation */}
      <nav 
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled 
            ? "py-3 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm" 
            : "py-5 bg-transparent border-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo iconSize={24} textSize="1.1rem" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Tools</a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <div className="w-px h-4 bg-border/60 mx-1" />
            <a href="https://github.com/lwshakib/bytetools" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Layout className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[5%] left-[15%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={0}
          >
            <Badge variant="secondary" className="mb-6 px-3 py-1 bg-primary/5 text-primary border-primary/10 rounded-full text-[10px] font-bold tracking-wider uppercase">
              Free & Open Source Tools
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={1}
            className="text-4xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-8"
          >
            Essential tools for your <br />
            <span className="text-muted-foreground">digital life.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A curated collection of lightweight, privacy-focused utilities designed to help you work faster and smarter. No ads, No tracking, Just tools.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="h-12 px-8 rounded-full font-medium" asChild>
              <a href="#tools">Explore Tools</a>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full font-medium" asChild>
              <a href="https://github.com/lwshakib/bytetools" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 bg-muted/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Toolbox</h2>
              <p className="text-muted-foreground">Select a tool to get started. All calculations are performed instantly in your browser.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {tools.length} Tools Available
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                custom={i % 6}
              >
                <Link href={tool.url} className="group block h-full">
                  <div className="h-full p-6 bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all rounded-2xl relative overflow-hidden">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105", tool.bg)}>
                      <tool.icon className={cn("w-5 h-5", tool.color)} />
                    </div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                      {tool.title}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Built for Everyone</h2>
            <p className="text-muted-foreground">ByteTools is built with focus on simplicity, speed, and privacy. Here's why you'll love it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-3">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-muted/30 border-t border-border/40">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Common Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about the platform.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "Is ByteTools completely free?",
                a: "Yes, ByteTools is 100% free to use. There are no hidden costs, no premium features behind a paywall, and no subscription required."
              },
              {
                q: "Is my data safe?",
                a: "Absolutely. ByteTools is designed with privacy at its core. All calculations and data processing happen within your browser. We do not store or track any of the information you input into the tools."
              },
              {
                q: "Do I need to create an account?",
                a: "No account is needed. You can use all the tools instantly without any sign-up or login process."
              },
              {
                q: "How can I contribute?",
                a: "ByteTools is an open-source project. You can contribute by reporting bugs, suggesting new features, or submitting pull requests on our GitHub repository."
              }
            ].map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`} 
                className="bg-card border border-border/40 px-6 rounded-2xl overflow-hidden shadow-sm"
              >
                <AccordionTrigger className="text-[15px] font-medium hover:no-underline transition-colors py-5 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[3rem] bg-secondary text-secondary-foreground p-12 md:p-24 text-center relative overflow-hidden shadow-xl border border-border/50">
            {/* Subtle themed background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background/50 to-secondary opacity-50" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,var(--primary),transparent_15%)] opacity-[0.03] dark:opacity-[0.08]" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,var(--primary),transparent_15%)] opacity-[0.03] dark:opacity-[0.08]" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1]">
                Ready to simplify <br />
                <span className="opacity-50">your digital workflow?</span>
              </h2>
              <p className="text-secondary-foreground/70 max-w-lg mx-auto mb-12 text-lg md:text-xl font-medium leading-relaxed">
                Join thousands of users who use ByteTools every day to streamline their tasks. Fast, private, and always open source.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="default" className="h-14 px-10 rounded-full font-semibold shadow-xl" asChild>
                  <a href="#tools">Explore the Toolbox</a>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-full font-semibold backdrop-blur-sm bg-background/20 hover:bg-background/40 transition-colors" asChild>
                  <a href="https://github.com/lwshakib/bytetools" target="_blank" rel="noopener noreferrer">
                    <Github className="w-5 h-5 mr-2" />
                    Star on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="space-y-6">
              <Logo iconSize={30} textSize="1.4rem" />
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Simple, powerful, and privacy-focused utilities for developers and everyday users. Built for the modern web.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/lwshakib/bytetools" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-red-500/10 hover:text-red-600 transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-pink-500/10 hover:text-pink-600 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-blue-400/10 hover:text-blue-400 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-600 transition-all">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              {[
                { title: "Tools", links: ["Timezones", "Password Gen", "Daily Planner", "QR Hub"] },
                { title: "Resources", links: ["GitHub", "Docs", "Changelog", "Support"] },
                { title: "Legal", links: ["Privacy", "Terms", "License"] },
              ].map((col, i) => (
                <div key={i} className="space-y-6">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">{col.title}</h4>
                  <ul className="space-y-4">
                    {col.links.map((link) => (
                      <li key={link}>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground">
              © 2026 ByteTools. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v2.1.0 Stable
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
