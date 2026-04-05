import React, { useState, useEffect, useRef } from "react";
import { Github, ChevronDown, ChevronUp, Users, Zap, Code2, Heart, ExternalLink, Star, GitFork } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const contributors = [
  {
    name: "Hardik Dhawan",
    githubId: "HardikDhawan9311",
    role: "Full Stack Developer",
    avatar: "https://github.com/HardikDhawan9311.png",
  },
  {
    name: "Contributor 2",
    githubId: "contributor2",
    role: "Frontend Developer",
    avatar: "https://github.com/contributor2.png",
  },
  {
    name: "Contributor 3",
    githubId: "contributor3",
    role: "Backend Developer",
    avatar: "https://github.com/contributor3.png",
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

// ─── Animated counter ─────────────────────────────────────────────────────────

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Intersection observer hook ───────────────────────────────────────────────

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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ value, label, suffix = "+", shouldCount }) {
  const count = useCountUp(value, 1600, shouldCount);
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] bg-clip-text text-transparent">
        {count}{suffix}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

// ─── Contributor Card ─────────────────────────────────────────────────────────

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
      {/* Glow ring on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7F5AF0]/10 to-[#C77DFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

      {/* Avatar */}
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
        {/* Online dot */}
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#7F5AF0] border-2 border-white dark:border-[#0d0b14] rounded-full flex items-center justify-center">
          <Github size={8} className="text-white" />
        </div>
      </div>

      {/* Info */}
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

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AboutUs() {
  const [heroRef, heroInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.2);
  const [colabRef, colabInView] = useInView(0.1);
  const [contribRef, contribInView] = useInView(0.05);
  const [geekRef, geekInView] = useInView(0.1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0b14] transition-colors duration-300">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-24 pb-20 px-4"
      >
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7F5AF0]/20 rounded-full blur-3xl -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C77DFF]/15 rounded-full blur-3xl translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? "translateY(0)" : "translateY(-20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#7F5AF0]/20 to-[#C77DFF]/20 border border-[#7F5AF0]/30 text-[#7F5AF0] dark:text-[#C77DFF] text-xs font-semibold uppercase tracking-widest mb-6"
          >
            <Heart size={12} /> Built with passion by GeekRoom × BitePass
          </div>

          {/* Headline */}
          <h1
            style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease" }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6"
          >
            Powering Events,{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] bg-clip-text text-transparent">
                One Bite
              </span>
              {/* Underline */}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] rounded-full" />
            </span>{" "}
            at a Time
          </h1>

          <p
            style={{ opacity: heroInView ? 1 : 0, transform: heroInView ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s 0.2s ease, transform 0.7s 0.2s ease" }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            BitePass is an open-source event meal management platform, crafted by the tech community at GeekRoom
            to bring order, transparency and delight to hackathon meal experiences.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={50}  label="Events Powered"  shouldCount={statsInView} />
            <StatCard value={5000} label="Meals Managed" shouldCount={statsInView} />
            <StatCard value={10}  label="Contributors"    shouldCount={statsInView} />
            <StatCard value={1}   label="GeekRoom ❤️"  suffix="" shouldCount={statsInView} />
          </div>
        </div>
      </section>

      {/* ── Collaboration section ─────────────────────────────────────────── */}
      <section ref={colabRef} className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div
            style={{ opacity: colabInView ? 1 : 0, transform: colabInView ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-[#7F5AF0] mb-3 block">The Collaboration</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              BitePass <span className="text-gray-400 dark:text-gray-500">×</span> GeekRoom
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* BitePass card */}
            <div
              style={{ opacity: colabInView ? 1 : 0, transform: colabInView ? "translateX(0)" : "translateX(-40px)", transition: "opacity 0.7s 0.1s ease, transform 0.7s 0.1s ease" }}
              className="relative group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-8 overflow-hidden hover:shadow-2xl hover:shadow-[#7F5AF0]/10 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#7F5AF0]/20 to-[#C77DFF]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />

              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7F5AF0] to-[#C77DFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7F5AF0]/30 mb-6">
                  <Zap size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">BitePass</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  BitePass is a full-stack event meal management system. Organisers create events, add participants
                  and configure meal schedules. Every participant receives a personalised QR code. At meal stations,
                  coordinators scan QR codes to validate and record redemptions — ensuring no double-dips and a
                  smooth, fast experience even at scale.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["React", "Node.js", "MongoDB", "QR Codes", "JWT Auth"].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-[#7F5AF0]/10 text-[#7F5AF0] dark:text-[#C77DFF] rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* GeekRoom card */}
            <div
              style={{ opacity: colabInView ? 1 : 0, transform: colabInView ? "translateX(0)" : "translateX(40px)", transition: "opacity 0.7s 0.2s ease, transform 0.7s 0.2s ease" }}
              className="relative group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-8 overflow-hidden hover:shadow-2xl hover:shadow-[#C77DFF]/10 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-[#C77DFF]/20 to-[#7F5AF0]/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />

              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#C77DFF] to-[#7F5AF0] rounded-xl flex items-center justify-center shadow-lg shadow-[#C77DFF]/30 mb-6">
                  <Code2 size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">GeekRoom</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  GeekRoom is the premier technical community of Maharaja Agrasen Institute of Technology, New Delhi.
                  Founded to bridge the gap between academia and industry, GeekRoom hosts hackathons, coding contests,
                  open-source sprints and expert sessions. With hundreds of active members, it has become a launchpad
                  for many real-world projects — BitePass being one of them.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["MAIT, Delhi", "Hackathons", "Open Source", "Community", "Innovation"].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium bg-[#C77DFF]/10 text-[#C77DFF] dark:text-[#C77DFF] rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Connector / collab detail */}
          <div
            style={{ opacity: colabInView ? 1 : 0, transform: colabInView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.7s 0.35s ease, transform 0.7s 0.35s ease" }}
            className="mt-8 bg-gradient-to-r from-[#7F5AF0]/10 via-[#C77DFF]/10 to-[#7F5AF0]/10 border border-[#7F5AF0]/20 rounded-2xl p-8 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#7F5AF0]/40" />
              <span className="text-2xl font-black bg-gradient-to-r from-[#7F5AF0] to-[#C77DFF] bg-clip-text text-transparent">×</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C77DFF]/40" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
              This collaboration is a testament to what communities can build when passion meets purpose.
              GeekRoom provided the problem; BitePass is the solution — open-sourced and freely available for
              anyone running events that deserve a seamless meal experience.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contributors ──────────────────────────────────────────────────── */}
      <section ref={contribRef} className="px-4 pb-24 bg-gray-100/50 dark:bg-white/[0.02] py-20">
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

          {/* GitHub CTA */}
          <div
            style={{ opacity: contribInView ? 1 : 0, transition: "opacity 0.6s 0.4s ease" }}
            className="mt-12 text-center"
          >
            <a
              href="https://github.com/HardikDhawan9311/BitePass"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-sm rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <Github size={18} />
              View on GitHub
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── GeekRoom Description ──────────────────────────────────────────── */}
      <section ref={geekRef} className="px-4 pb-24 pt-16">
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
                className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-7 hover:shadow-xl hover:shadow-[#7F5AF0]/10 hover:-translate-y-1 transition-all duration-300"
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

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-28 bg-gray-100/50 dark:bg-white/[0.02] pt-20">
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
    </div>
  );
}
