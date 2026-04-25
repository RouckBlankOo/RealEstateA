import Navbar from "@/components/Navbar";
import Image from "next/image";
import HeroVideo from "@/components/HeroVideo";
import Link from "next/link";

const features = [
  {
    icon: "apartment",
    title: "Property Listings",
    desc: "Browse curated villas, penthouses, and estates across Tunisia's most prestigious locations.",
  },
  {
    icon: "directions_car",
    title: "Vehicle Marketplace",
    desc: "Discover limited-edition supercars, vintage classics, and bespoke luxury vehicles.",
  },
  {
    icon: "map",
    title: "Live Map Search",
    desc: "Explore properties and vehicles with an interactive, real-time map interface.",
  },
  {
    icon: "handshake",
    title: "Smart Negotiations",
    desc: "Our AI-powered negotiation engine helps you secure the best deal effortlessly.",
  },
  {
    icon: "airport_shuttle",
    title: "Booking & Driver",
    desc: "Schedule viewings and request a private chauffeur with a single tap.",
  },
  {
    icon: "workspace_premium",
    title: "Curator Credits",
    desc: "Earn and spend premium credits for exclusive access and priority services.",
  },
];

const steps = [
  {
    num: "01",
    icon: "search",
    title: "Browse",
    desc: "Explore thousands of curated listings tailored to your lifestyle.",
  },
  {
    num: "02",
    icon: "connect_without_contact",
    title: "Connect",
    desc: "Chat directly with sellers, schedule tours, and get AI-assisted guidance.",
  },
  {
    num: "03",
    icon: "receipt_long",
    title: "Transact",
    desc: "Close deals securely with our verified payment and contract system.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar activePage="home" />

      {/* ── Hero ── */}
      <section
        className="relative flex-1 overflow-hidden"
        style={{ minHeight: "90vh" }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #F85B00 0%, #FCB78E 40%, #fce8dc 70%, #f9f9f9 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16">
          {/* Left — Copy */}
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-sm font-medium text-white">
              <span className="material-symbols-outlined text-[16px]">
                diamond
              </span>
              Tunisia&apos;s Premier Luxury Marketplace
            </div>

            <h1
              className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Discover Your Dream
              <br />
              <span className="text-[#370e00]">Home or Car</span>
              <br />
              in Tunisia.
            </h1>

            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Architectural masterpieces and bespoke vehicles, curated for those
              who demand the extraordinary.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">
                <span className="whitespace-nowrap flex items-center justify-center">
                  Download The App
                </span>
              </button>
              <a
                href="#"
                className="glass-card flex items-center gap-3 px-6 py-3 rounded-2xl text-white font-semibold hover:bg-white/25 transition-colors"
              >
                <span className="material-symbols-outlined">android</span>
                Play Store
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#cc4900", "#a33900", "#7f2b00"].map((c, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: c }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  +2k
                </div>
              </div>
              <span className="text-sm text-white/80 font-medium">
                Trusted by 2,000+ discerning buyers
              </span>
            </div>
          </div>

          {/* Right — Hero Video */}
          <div
            className="flex-1 relative hidden lg:flex items-center justify-center"
            style={{ minHeight: "440px" }}
          >
            <HeroVideo />
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 80H1440V30C1200 70 900 10 600 50C300 90 100 20 0 40V80Z"
              fill="#f9f9f9"
            />
          </svg>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a33900]">
              Why Tun Realestate
            </p>
            <h2
              className="text-4xl font-bold text-[#1a1c1c]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Everything You Need,
              <br />
              <span className="text-[#a33900] italic">
                Nothing You Don&apos;t.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-3xl p-8 shadow-sm border border-[#e3bfb1]/30 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#ffdbce] flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-[#a33900]">
                    {f.icon}
                  </span>
                </div>
                <h3
                  className="font-semibold text-[#1a1c1c] mb-2"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[#5b4137] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Section ── */}
      <section id="app" className="py-24 px-6 bg-[#eeeeee]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Phone mockup */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-64 h-[480px] bg-[#1a1c1c] rounded-[3rem] p-3 shadow-2xl">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-white/20 rounded-full" />
              <div className="w-full h-full bg-gradient-to-b from-[#F85B00] to-[#a33900] rounded-[2.4rem] overflow-hidden flex flex-col p-5 gap-3">
                <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest">
                  Featured
                </p>
                <div className="flex-1 bg-white/10 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&q=80"
                    alt="App preview"
                    fill
                    className="object-cover opacity-80"
                  />
                </div>
                <div className="bg-white/15 rounded-2xl p-3">
                  <p className="text-white text-xs font-semibold">
                    The Alabaster Atrium
                  </p>
                  <p className="text-white/70 text-[10px] mt-0.5">
                    Sidi Bou Saïd · 4.25M TND
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="flex-1 space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#a33900] mb-3">
                Mobile Experience
              </p>
              <h2
                className="text-4xl font-bold text-[#1a1c1c] leading-tight"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Your Curator,
                <br />
                Always in Your Pocket.
              </h2>
            </div>
            <ul className="space-y-5">
              {[
                {
                  icon: "notifications_active",
                  text: "Real-time alerts for new listings matching your taste",
                },
                {
                  icon: "chat_bubble",
                  text: "AI-powered chat assistant to guide every decision",
                },
                {
                  icon: "security",
                  text: "Secure, end-to-end encrypted negotiations",
                },
                {
                  icon: "offline_bolt",
                  text: "Browse offline — your saved collections always available",
                },
              ].map((item) => (
                <li key={item.icon} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ffdbce] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#a33900] text-[20px]">
                      {item.icon}
                    </span>
                  </div>
                  <p className="text-[#5b4137] text-sm leading-relaxed pt-2">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="bg-[#a33900] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#cc4900] transition-colors"
              >
                Start Your Journey
              </a>
              <a
                href="#how-it-works"
                className="border border-[#a33900] text-[#a33900] px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#ffdbce] transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a33900] mb-3">
            Simple Process
          </p>
          <h2
            className="text-4xl font-bold text-[#1a1c1c] mb-16"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            From Discovery to Keys in Hand
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-[#e3bfb1]" />

            {steps.map((s) => (
              <div
                key={s.num}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#a33900] flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white">
                      {s.icon}
                    </span>
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ffdbce] text-[#a33900] text-xs font-bold flex items-center justify-center stats-font">
                    {s.num.replace("0", "")}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold text-[#1a1c1c]"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-[#5b4137] max-w-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-[#a33900] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#cc4900] transition-colors shadow-lg"
            >
              Browse Listings
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer is rendered globally in the layout */}
    </div>
  );
}
