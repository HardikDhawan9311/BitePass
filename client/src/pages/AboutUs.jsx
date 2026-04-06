import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Globe,
  Award,
  Code,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Rocket,
  Target,
  Heart,
  Github,
  Linkedin,
  ExternalLink,
  Trophy,
  Milestone,
  CalendarDays,
  Briefcase,
  Star,
  GitFork,
  Code2,
  Ticket
} from "lucide-react";
import Navbar from "../Components/NavBar";
import Footer from "../Components/Footer";

// ─── Data ─────────────────────────────────────────────────────────────────────

const contributors = [
  {
    name: "Hardik Dhawan",
    githubId: "HardikDhawan9311",
    role: "Full Stack Developer",
    avatar: "https://github.com/HardikDhawan9311.png",
  },
  {
    name: "Harsh Gupta",
    githubId: "RealHarshGupta",
    role: "Developer",
    avatar: "https://github.com/RealHarshGupta.png",
  },
  {
    name: "Vanshika Batra",
    githubId: "vanshikabatra200504-stack",
    role: "Frontend Developer",
    avatar: "https://github.com/vanshikabatra200504-stack.png",
  },
  {
    name: "Contributor 4",
    githubId: "contributor4",
    role: "UI/UX Designer",
    avatar: "https://github.com/contributor4.png",
  },
];

const faqs = [
  {
    q: "What is BitePass?",
    a: "BitePass is an intelligent event meal management system that simplifies tracking participants' meal redemptions at events. It generates unique QR codes for each participant, enabling organisers to scan and validate meals in real time — eliminating queues, duplicates and manual errors.",
  },
  {
    q: "What is GeekRoom?",
    a: "GeekRoom is a thriving tech community at Maharaja Agrasen Institute of Technology, Delhi. It is dedicated to fostering innovation, collaboration and technical excellence among students through hackathons, workshops, talks and open-source projects.",
  },
  {
    q: "How did BitePass and GeekRoom collaborate?",
    a: "BitePass was born inside GeekRoom as an internal tool to manage food distribution at hackathons and tech events. The community's need for a streamlined, scalable solution led to BitePass being developed and open-sourced as a production-ready project.",
  },
  {
    q: "Is BitePass open source?",
    a: "Yes! BitePass is fully open source and welcomes contributions from the developer community. You can find the repository on GitHub, raise issues, or submit pull requests to help improve the platform.",
  },
  {
    q: "How does the QR-based meal validation work?",
    a: "Upon registration each participant receives a unique QR code tied to their profile. Event coordinators use the BitePass scanner to read codes at meal stations. The system instantly verifies eligibility and marks the meal as redeemed, preventing duplicate claims.",
  },
  {
    q: "Can I use BitePass for my own events?",
    a: "Absolutely. BitePass is designed to scale from small club events to large multi-day hackathons. Just set up the admin panel, upload participants, configure your meal schedule and you're good to go.",
  },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

const Counter = ({ from, to, suffix = "" }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const startTime = performance.now();

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(2, -10 * progress); // easeOutExpo
            setCount(Math.round(from + (to - from) * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [from, to]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── Intersection Observer Hook ──────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Contributor Card ────────────────────────────────────────────────────────

function ContributorCard({ contributor, index }) {
  const [ref, inView] = useInView(0.1);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${index * 80}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
      }}
      className="group relative bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:shadow-xl hover:shadow-[#7F5AF0]/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7F5AF0]/10 to-[#C77DFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

      <div className="relative">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-[#7F5AF0]/30 group-hover:ring-[#C77DFF]/60 transition-all duration-300">
          {!imgError ? (
            <img
              src={contributor.avatar}
              alt={contributor.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] text-white text-2xl font-bold">
              {contributor.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#7F5AF0] border-2 border-white dark:border-[#0d0b14] rounded-full flex items-center justify-center">
          <Github size={8} className="text-white" />
        </div>
      </div>

      <div className="text-center">
        <p className="font-bold text-gray-900 dark:text-white text-base">{contributor.name}</p>
        <p className="text-xs text-[#7F5AF0] font-semibold mt-0.5">{contributor.role}</p>
        <a
          href={`https://github.com/${contributor.githubId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-[#7F5AF0] dark:hover:text-[#C77DFF] transition-colors font-mono"
        >
          <Github size={12} />
          @{contributor.githubId}
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}

// ─── FAQ Item ────────────────────────────────────────────────────────────────

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 ${
        open
          ? "border-[#7F5AF0]/50 bg-[#7F5AF0]/5 dark:bg-[#7F5AF0]/10"
          : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#7F5AF0]/30"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        aria-expanded={open}
      >
        <span className={`font-semibold text-sm md:text-base transition-colors ${open ? "text-[#7F5AF0]" : "text-gray-900 dark:text-white"}`}>
          {faq.q}
        </span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
          open ? "bg-[#7F5AF0] text-white" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
        }`}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? "300px" : "0",
          opacity: open ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.2s ease",
          overflow: "hidden",
        }}
      >
        <p className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {faq.a}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const AboutUs = () => {
  const [contribRef, contribInView] = useInView(0.05);
  const [geekRef, geekInView] = useInView(0.1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0b14] text-gray-900 dark:text-white transition-colors duration-300 selection:bg-[#7F5AF0]/30 font-inter overflow-x-hidden">
      <Navbar />

      {/* 0. Collaboration Header */}
      <div className="w-full bg-white/80 dark:bg-[#1A1625]/40 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 py-12 px-6 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
          <div className="flex items-center justify-center gap-14 md:gap-24">
            {/* Logo: BitePass */}
            <div className="group cursor-pointer">
              <div className="w-48 h-48 bg-gradient-to-br from-[#7F5AF0]/20 to-[#C77DFF]/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(127,90,240,0.25)] dark:shadow-[0_0_120px_rgba(127,90,240,0.4)] group-hover:shadow-[0_0_150px_rgba(127,90,240,0.6)] transition-all duration-700 transform group-hover:scale-110 relative">
                {/* Glowing Aura */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] opacity-20 dark:opacity-30 blur-[80px] transition-opacity duration-700 group-hover:opacity-40"></div>
                
                <div className="w-32 h-32 bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500 group-hover:rotate-6">
                  <Ticket className="text-white transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" size={64} />
                </div>
              </div>
            </div>

            <div className="text-[#C77DFF] dark:text-[#7F5AF0] font-black italic text-7xl opacity-30 select-none px-6">×</div>

            {/* Logo: Geek Room */}
            <div className="group cursor-pointer">
              <div className="w-48 h-48 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.2)] dark:shadow-[0_0_120px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_150px_rgba(255,255,255,0.3)] transition-all duration-700 transform group-hover:scale-110 relative overflow-visible">
                {/* Glowing Aura */}
                <div className="absolute inset-0 rounded-full bg-gray-400 dark:bg-white opacity-20 dark:opacity-10 blur-[80px] transition-opacity duration-700 group-hover:opacity-30"></div>
                
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden relative z-10 border border-white/20 transition-transform duration-500 group-hover:-rotate-6">
                  <img src="/assets/geekroom logo black.webp" alt="Geek Room Logo" className="w-full h-full object-contain p-4" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-300 text-lg md:text-xl font-medium tracking-wide text-center max-w-2xl">
            A collaborative project built with innovation and community spirit.
          </p>
        </div>
      </div>

      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-48 px-6 text-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7F5AF0]/10 via-transparent to-transparent opacity-50 blur-[120px] pointer-events-none animate-pulse"></div>

        {/* Code-style background pattern */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none select-none overflow-hidden font-mono text-[10px] leading-tight">
          {Array(40).fill(0).map((_, i) => (
            <div key={i} className="whitespace-nowrap translate-x-[var(--x)]" style={{ '--x': `${Math.random() * 20}%` }}>
              {`const bitepass = { type: 'innovation', collab: 'geekroom', users: '100k+', status: 'active' }; `.repeat(10)}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-5xl mx-auto space-y-10"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[1] text-gray-900 dark:text-white">
            About <br className="md:hidden" /> <span className="text-[#C77DFF] bg-clip-text text-transparent bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF]">BitePass</span>
          </h1>

          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white opacity-90 max-w-3xl mx-auto leading-snug">
              Revolutionizing the way users discover and access food experiences seamlessly.
            </h2>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              BitePass is a modern platform designed to simplify and enhance how people explore, access, and enjoy food services. Built with performance, usability, and innovation in mind, BitePass aims to deliver a seamless digital experience.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 2. About the Platform */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-gray-100 dark:border-white/5 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C77DFF]/5 blur-[100px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">What is <span className="text-[#C77DFF]">BitePass</span>?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xl leading-relaxed">
                BitePass is built to bridge the gap between users and food services through a fast, intuitive, and scalable platform. It focuses on delivering convenience, efficiency, and a smooth user experience using modern web technologies.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {[
              { icon: Zap, title: "Performance First", desc: "Built with speed-focused architecture for high-traffic events." },
              { icon: Shield, title: "Secure Access", desc: "Reliable and encrypted data management for every user." },
              { icon: Target, title: "Seamless Access", desc: "Intuitive workflows for a frictionless digital experience." },
              { icon: Rocket, title: "Scalable Growth", desc: "Engineered to support communities of any size." }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-gray-100 dark:border-white/10 p-8 rounded-[2.5rem] space-y-4 hover:shadow-lg dark:hover:bg-white/[0.05] hover:border-[#7F5AF0]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#7F5AF0]/10 rounded-xl flex items-center justify-center text-[#7F5AF0]">
                  {card.icon && <card.icon size={28} />}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Contributors Section (Current Style) */}
      <section ref={contribRef} className="px-4 pb-24 bg-gray-100/50 dark:bg-white/[0.02] py-20 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div
            style={{ opacity: contribInView ? 1 : 0, transform: contribInView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#7F5AF0] mb-3 block">The Team</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              Meet the <span className="bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] bg-clip-text text-transparent">Contributors</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto">
              These are the brilliant minds behind BitePass. Every line of code, every design decision, every bug fix —
              driven by community spirit.
            </p>
          </div>

          {contributors.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {contributors.map((c, i) => (
                <ContributorCard key={c.githubId} contributor={c} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No contributors listed yet.</p>
          )}

          <div
            style={{ opacity: contribInView ? 1 : 0, transition: "opacity 0.6s 0.4s ease" }}
            className="mt-12 text-center"
          >
            <a
              href="https://github.com/GeekRoom/BitePass"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-gray-900 dark:bg-white border border-gray-100 dark:border-white/10 text-white dark:text-gray-900 font-semibold text-sm rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <Github size={18} />
              View on GitHub
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* 4. More Than a Community (Current Style) */}
      <section ref={geekRef} className="px-4 pb-24 pt-16 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div
            style={{ opacity: geekInView ? 1 : 0, transform: geekInView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#7F5AF0] mb-3 block">About GeekRoom</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              More Than a Community
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Vibrant Community", desc: "Hundreds of passionate developers, designers and problem-solvers united by a love for technology and collaborative building." },
              { icon: Star, title: "Hackathons & Events", desc: "GeekRoom organises and participates in hackathons, coding challenges and technical fests throughout the year, nurturing talent at every level." },
              { icon: GitFork, title: "Open Source Culture", desc: "We believe in open collaboration. BitePass is just one of many projects born out of GeekRoom's commitment to building in the open and giving back to the community." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                style={{
                  opacity: geekInView ? 1 : 0,
                  transform: geekInView ? "translateY(0)" : "translateY(32px)",
                  transition: `opacity 0.6s ${i * 0.12}s ease, transform 0.6s ${i * 0.12}s ease`,
                }}
                className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:shadow-[#7F5AF0]/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#7F5AF0]/20 to-[#C77DFF]/20 rounded-xl flex items-center justify-center mb-5 group-hover:from-[#7F5AF0] group-hover:to-[#C77DFF] transition-all duration-300">
                  <Icon size={22} className="text-[#7F5AF0] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ Section (Current Style) */}
      <section className="px-4 pb-28 pt-20 border-t border-gray-100 dark:border-white/5 bg-gray-100/50 dark:bg-white/[0.01]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7F5AF0] mb-3 block">FAQs</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Frequently Asked <span className="bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] bg-clip-text text-transparent">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
