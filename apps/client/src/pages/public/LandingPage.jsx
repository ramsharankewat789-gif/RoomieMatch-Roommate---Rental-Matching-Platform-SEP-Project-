/**
 * LandingPage.jsx — Public landing page for RoomieMatch.
 *
 * Sections:
 *   1. Hero — search bar, social proof, CTA buttons
 *   2. Stats — platform numbers
 *   3. Features — what the platform offers
 *   4. How It Works — 3-step guide
 *   5. Compatibility — roommate matching highlight
 *   6. CTA — final sign-up prompt
 */
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";

export const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const handleSearch = (e) => {
    e.preventDefault();
    const dest = `/user/properties${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`;
    if (currentUser) {
      navigate(dest);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(dest)}`);
    }
  };

  return (
    <div className="flex-grow flex flex-col w-full">

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-20 pb-24 overflow-hidden hero-pattern flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 w-full">

          {/* Hero Text */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-sm text-primary icon-fill">verified</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Trusted by students worldwide
              </span>
            </div>

            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface max-w-2xl">
              Find your perfect{" "}
              <span className="text-primary relative inline-block">
                roommate
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-fixed-dim" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
              ,{" "}<br className="hidden sm:block" />
              without the stress.
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              A secure, university-approved platform connecting students and young
              professionals with compatible living partners and verified rental properties.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-lg bg-surface-container-lowest p-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant flex flex-col sm:flex-row gap-2 mt-4"
            >
              <div className="flex-grow flex items-center bg-surface-container px-4 py-3 rounded-lg">
                <span className="material-symbols-outlined text-outline mr-2">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full font-body-md text-on-surface placeholder-outline-variant p-0 outline-none"
                  placeholder="City or University..."
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-tint transition-colors flex items-center justify-center whitespace-nowrap active:scale-95"
              >
                Search
              </button>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                to="/register"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-tint transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Get Started Free
              </Link>
              <Link
                to="/user/properties"
                className="border border-outline text-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">home_work</span>
                Browse Properties
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-2 text-on-surface-variant">
              <div className="flex -space-x-3">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBy47hsK5Waz3XyvYoDPr16VkbS6xbJ9okD-OhfUHbpaR2fHx1pCzBnAkg7wY1_4d7A4CWjW8DV2f_WjWmP22uLxCzeIax7gAsH8PXwbymVE_iGPEQL5Suslg-pQ7SxcxKauRaycDgmagwDQJMknYeReVojp0HIp81w0vr66wEUSLzZK7zHe8WYhwBvC1vMfyhFsc9Vj3YndGfzpKFmkkZBMC_ScmLrsAgWU33Gj1NkF6Eo2U-0beuk",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuC6c4I0b0gIn_1sLvBNu8eni3NZ2KK1UArMcl8IXZj8vmgtXoTafm97gsa5TSyQXpR7tE1nzVFcX_EkRDsgMTM3A6GtUHKwX3fWkyZ3F1lMUGMwfkOXKl8ys1VNWBnVpS09vRfCzIg7SsUjm28ah-lVSF2BBjo2A29N0Yv0saI_vJqjefJcbduHi9pwCJUKSl3UpNC1ytb28NoIxMLhuFfTIYf70yo2P3aeTjKJ0SFBT0-HImeznIRW",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVowSyn0Y52e0EGwYS3Ely-v3MBl0wjszIMqnt7Hd6kt7K96uItPn5PBGFW3PJSmnYkheCvCW8wiPn0Ij1IJXWPSZ5fUOHM62VC1AB0mhpEJCdTTQ8LljQK1akZFZ9-Xta5BnucEwsVe0-R2Ch5opYNOVDwM93TlD3vNkNiPvpWmAIgF49l5MpPKFZeUzNnICrg1zhBDhwsW1xvgYEwqD8BI81dTNNAKrWhPXhghzBYaRttVh__cyQ",
                ].map((src, i) => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-surface object-cover" src={src} alt="" />
                ))}
              </div>
              <span className="font-label-sm text-label-sm font-semibold">
                Join 10,000+ matched roommates
              </span>
            </div>
          </div>

          {/* Hero image card */}
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[1.5] rounded-2xl overflow-hidden shadow-xl border border-outline-variant bg-surface-container-low transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                alt="RoomieMatch App Interface"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw198F3RReoAWQPDB6NBvw5ITvvjUJWnfgJ0h4eFG3yULmEEENUJT-eaYDrCdOKVlD-zLMi0WGnIVlaQhOKvcqs8lu9UcBbBH-Qe1i21rLIxCZxsvd59tEVBy6kSBNFxDMXhpJdY6rqmCtF8uQ3kFALY9GEdsaumK0Y7m5LtgKXTr63aJYRuft8TaU1PvS79p3tU2NCT402jvJrmqJjQaxpWNLjiUqcaZwwkmG1nC__PfFe0nsJVrHQEwrZ8nTT4STJg"
              />
              {/* Floating compatibility card */}
              <div className="absolute top-6 -left-6 bg-surface-container-lowest p-3 rounded-xl shadow-lg border border-outline-variant flex items-center gap-3 transform -rotate-3">
                <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary icon-fill">handshake</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">New Match</p>
                  <p className="font-label-md text-label-md text-on-surface font-bold">98% Compatibility</p>
                </div>
              </div>

              {/* Floating verified badge */}
              <div className="absolute bottom-6 -right-4 bg-surface-container-lowest p-3 rounded-xl shadow-lg border border-outline-variant flex items-center gap-2 transform rotate-2">
                <span className="material-symbols-outlined text-secondary icon-fill">verified</span>
                <span className="font-label-sm text-label-sm text-on-surface font-bold">Verified Listing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS ─────────────────────────────────────────────────────── */}
      <section className="bg-surface-container-low border-y border-outline-variant py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Students Matched",     icon: "group" },
              { value: "2,500+",  label: "Verified Properties",  icon: "home_work" },
              { value: "98%",     label: "Match Satisfaction",   icon: "thumb_up" },
              { value: "50+",     label: "Universities Covered", icon: "school" },
            ].map(({ value, label, icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[32px] icon-fill">{icon}</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">{value}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Everything you need in one place
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 max-w-2xl mx-auto">
              RoomieMatch combines smart roommate matching, verified property listings,
              real-time messaging, and secure identity verification into a single platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon:  "psychology",
                color: "bg-primary/10 text-primary",
                title: "Smart Compatibility Matching",
                desc:  "Our algorithm uses budget, lifestyle preferences, hobbies, location, and occupation to calculate a percentage match score — helping you find roommates you'll actually enjoy living with.",
              },
              {
                icon:  "home_work",
                color: "bg-secondary/10 text-secondary",
                title: "Verified Property Listings",
                desc:  "Every property goes through admin review before appearing on the platform. No fake listings — only verified homes from real landlords near your university.",
              },
              {
                icon:  "chat",
                color: "bg-tertiary/10 text-tertiary",
                title: "Real-Time Messaging",
                desc:  "Chat instantly with landlords and potential roommates using Socket.io-powered messaging. Typing indicators, read receipts, and zero delays.",
              },
              {
                icon:  "verified_user",
                color: "bg-primary/10 text-primary",
                title: "Identity Verification",
                desc:  "Upload your student ID or government ID to get the 'Verified' badge on your profile. Builds trust with landlords and roommate candidates.",
              },
              {
                icon:  "location_on",
                color: "bg-secondary/10 text-secondary",
                title: "Interactive Property Map",
                desc:  "View all available properties on an interactive OpenStreetMap. Find what's closest to your campus or workplace before booking a viewing.",
              },
              {
                icon:  "star",
                color: "bg-tertiary/10 text-tertiary",
                title: "Reviews & Ratings",
                desc:  "Leave honest reviews for properties and roommates. Read what others say before you commit — helping the whole community make better decisions.",
              },
            ].map(({ icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-md transition-shadow group"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-[24px] icon-fill">{icon}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">{title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              How RoomieMatch works
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
              Three simple steps to find your ideal living situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-0.5 bg-outline-variant" />

            {[
              {
                step: "01",
                icon: "person_add",
                title: "Create Your Profile",
                desc: "Register in under 2 minutes. Set your budget, lifestyle preferences, hobbies, and upload your student ID to get verified.",
              },
              {
                step: "02",
                icon: "search",
                title: "Discover & Match",
                desc: "Browse verified properties on the map or explore compatible roommates sorted by your personalised match percentage.",
              },
              {
                step: "03",
                icon: "handshake",
                title: "Connect & Apply",
                desc: "Message landlords and roommates directly. Apply for a property with a personal note. Manage everything from your dashboard.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4 relative">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
                  <span className="material-symbols-outlined text-on-primary text-[28px] icon-fill">{icon}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{step}</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. COMPATIBILITY HIGHLIGHT ───────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/20 rounded-full border border-primary/30">
              <span className="material-symbols-outlined text-sm text-primary icon-fill">psychology</span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                AI-Powered Matching
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Meet people who share <br className="hidden sm:block" />
              <span className="text-primary">your lifestyle.</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Our compatibility algorithm weighs five factors to produce a single
              match percentage — so you spend less time awkward house-hunting and
              more time actually living.
            </p>
            <div className="space-y-4">
              {[
                { label: "Budget Compatibility",     pct: 30, color: "bg-primary" },
                { label: "Lifestyle Preferences",    pct: 30, color: "bg-secondary" },
                { label: "Shared Interests",         pct: 20, color: "bg-tertiary" },
                { label: "Location Match",           pct: 10, color: "bg-primary" },
                { label: "Occupation / University",  pct: 10, color: "bg-secondary" },
              ].map(({ label, pct, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between font-label-md text-label-md text-on-surface">
                    <span>{label}</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${pct * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
            {[
              { name: "Alex M.", uni: "State University",  score: 97, tags: ["Night Owl", "No Pets", "Coding"] },
              { name: "Chloe H.", uni: "State University", score: 91, tags: ["Night Owl", "Cat Allowed", "Music"] },
              { name: "Marcus B.", uni: "State University",score: 85, tags: ["Early Bird", "Pets OK", "Soccer"] },
              { name: "Jamie K.", uni: "City College",     score: 78, tags: ["Flexible", "No Pets", "Reading"] },
            ].map(({ name, uni, score, tags }) => (
              <div key={name} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-primary font-bold text-sm">
                    {name.charAt(0)}
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    score >= 90 ? "bg-secondary-container text-on-secondary-container"
                    : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {score}% Match
                  </span>
                </div>
                <p className="font-label-md text-label-md text-on-surface font-bold">{name}</p>
                <p className="text-xs text-on-surface-variant mb-3">{uni}</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map(t => (
                    <span key={t} className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-medium border border-outline-variant/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-on-primary rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-on-primary rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-on-primary/20 rounded-full">
            <span className="material-symbols-outlined text-on-primary text-[32px] icon-fill">home</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-primary font-bold">
            Ready to find your perfect roommate?
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary/80 max-w-xl mx-auto leading-relaxed">
            Join thousands of students who found compatible roommates and verified properties
            through RoomieMatch. It's free to sign up.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              to="/register"
              className="bg-on-primary text-primary font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-surface-container-lowest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Create Free Account
            </Link>
            <Link
              to="/user/properties"
              className="border-2 border-on-primary/40 text-on-primary font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-on-primary/10 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              Browse Properties
            </Link>
          </div>
          <p className="text-on-primary/60 text-sm">
            No credit card required &nbsp;·&nbsp; Free forever for students
          </p>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
