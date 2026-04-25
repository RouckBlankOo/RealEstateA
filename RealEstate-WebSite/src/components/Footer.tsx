import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-[#eeeeee] border-t border-[#e3bfb1]/40 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b border-[#e3bfb1]/40">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-[#a33900]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              <span className="material-symbols-outlined text-[20px]">
                diamond
              </span>
              Tun Realestate
            </Link>
            <p className="text-sm text-[#5b4137] leading-relaxed max-w-xs">
              Tunisia&apos;s premier curated marketplace for architectural
              masterpieces and bespoke automotive artistry.
            </p>
            <div className="flex gap-3 pt-1">
              {["App Store", "Play Store"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-xs font-medium px-4 py-2 rounded-full border border-[#e3bfb1] text-[#a33900] hover:bg-[#a33900] hover:text-white transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#8f7065]">
              Explore
            </h4>
            <ul className="space-y-2">
              {["Properties", "Vehicles", "Map Search", "Collections"].map(
                (l) => (
                  <li key={l}>
                    <Link
                      href={`/${l.toLowerCase().replace(" ", "-")}`}
                      className="text-sm text-[#5b4137] hover:text-[#a33900] transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#8f7065]">
              Services
            </h4>
            <ul className="space-y-2">
              {[
                "Curator Credits",
                "Negotiations",
                "Booking & Driver",
                "Global Sourcing",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-[#5b4137] hover:text-[#a33900] transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#8f7065]">
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy",
                "GDPR",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-[#5b4137] hover:text-[#a33900] transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#8f7065]">
              Contact
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-[#5b4137]">
                <span className="material-symbols-outlined text-[16px] text-[#a33900]">
                  location_on
                </span>
                Tunis, Tunisia
              </li>
              <li className="flex items-center gap-2 text-sm text-[#5b4137]">
                <span className="material-symbols-outlined text-[16px] text-[#a33900]">
                  mail
                </span>
                RealEstate@Connect.tn
              </li>
              <li className="flex items-center gap-2 text-sm text-[#5b4137]">
                <span className="material-symbols-outlined text-[16px] text-[#a33900]">
                  phone
                </span>
                +216 71 000 000
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-xs text-[#8f7065]">
            © {new Date().getFullYear()} Tun Realestate. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#8f7065]">
            <span className="material-symbols-outlined text-[14px]">
              language
            </span>
            <a href="#" className="hover:text-[#a33900] transition-colors">
              English
            </a>
            <span>·</span>
            <a href="#" className="hover:text-[#a33900] transition-colors">
              Français
            </a>
            <span>·</span>
            <a href="#" className="hover:text-[#a33900] transition-colors">
              العربية
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
