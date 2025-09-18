import React, {useEffect, useState} from "react";
import {
  ArrowRight,
  MapPin,
  Star,
  Wifi,
  Wind,
  BookOpen,
  Lock,
  Sun,
  Building2,
  Trees,
  Phone,
  Copy,
  Check,
} from "lucide-react";

// NaiUdaan Library – Modern, light-themed landing section
// Smooth reveal on scroll using IntersectionObserver and Tailwind transitions

const features = [
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Spacious Seating",
    desc: "Big size seats for long, comfortable study sessions.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "King Size Lockers",
    desc: "Secure, large lockers for your books and valuables.",
  },
  {
    icon: <Trees className="w-6 h-6" />,
    title: "80 ft Balcony",
    desc: "Only library on the first floor with a long airy balcony.",
  },
  {
    icon: <Sun className="w-6 h-6" />,
    title: "Rooftop Access",
    desc: "Extra open space provided by the management for breaks.",
  },
  {
    icon: <Wind className="w-6 h-6" />,
    title: "Cool Summers",
    desc: "AC and temperature managed for a very cool summer.",
  },
  {
    icon: <Wifi className="w-6 h-6" />,
    title: "High Speed Wi‑Fi",
    desc: "Reliable internet for references and mock tests.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Competitive Books",
    desc: "Resources for JEE, NEET, NDA, SSC and more.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Daily Newspapers (UPSC)",
    desc: "The Indian Express, The Hindu, Employment News, Prabhat Khabar, Hindustan, Speedy, Magazines, Pratiyogita Darpan and many more available daily.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Polite Management",
    desc: "Friendly staff, open to feedback, Sunday full-time open.",
  },
];

const Home: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText("6207694500");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };
  useEffect(() => {
    // Smooth reveal animation
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("opacity-0", "translate-y-6");
            e.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      {threshold: 0.2}
    );

    const nodes = document.querySelectorAll("[data-reveal]");
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="bg-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div
              data-reveal
              className="transition-all duration-700 opacity-0 translate-y-6"
            >
              <span className="inline-flex items-center gap-2 text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4" /> Top Study Space in Singh More,
                Hatiya
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
                NaiUdaan Library
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                A peaceful, modern library for all competitive exam aspirants —
                built for deep focus, comfort, and consistency.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://share.google/uO9KCuJRtlaP8ctAI"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Read Google Reviews <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#location"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  <MapPin className="w-4 h-4" /> View Location
                </a>
              </div>

              {/* Contact Phone Number */}
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Contact us:</span>
                </div>
                <button
                  onClick={copyPhoneNumber}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition group"
                  title="Click to copy phone number"
                >
                  <span className="font-semibold text-blue-800">
                    6207694500
                  </span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                  )}
                </button>
                {copied && (
                  <span className="text-sm text-green-600 font-medium">
                    Phone number copied!
                  </span>
                )}
              </div>
            </div>
            <div
              data-reveal
              className="transition-all duration-700 delay-100 opacity-0 translate-y-6"
            >
              <div className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-tr from-blue-100 via-white to-blue-50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-semibold">Study in Peace</h3>
                    <p className="mt-2 text-gray-600">
                      Big seats • King lockers • AC • Wi‑Fi • Balcony • Rooftop
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none absolute -z-10 blur-3xl inset-0 bg-gradient-to-tr from-blue-100/40 via-transparent to-blue-200/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="transition-all duration-700 opacity-0 translate-y-6"
          >
            <h2 className="text-3xl font-bold">Why Students Love Us</h2>
            <p className="mt-2 text-gray-600">
              Everything you need for competitive success — without
              distractions.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                data-reveal
                className="transition-all duration-700 opacity-0 translate-y-6 rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md"
                style={{transitionDelay: `${(i % 6) * 60}ms`}}
              >
                <div className="text-blue-600">{f.icon}</div>
                <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Highlight */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="transition-all duration-700 opacity-0 translate-y-6 rounded-2xl border border-blue-100 bg-white p-8 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <blockquote className="text-gray-700">
                "Nice library, well planned, big size seat and king size locker
                available here. One of the best library in Singh More Hatiya.
                Only library on first floor. 80 feet balcony available in the
                first floor. Roof top space provided by the management. In
                winter they are providing heater also. In summer temperature is
                very cool. Sunday full time available. Management is so polite.
                They are always taking feedback. AC, High speed wifi,
                competitive books for JEE, NEET, NDA, SSC."
              </blockquote>
            </div>
            <a
              href="https://share.google/uO9KCuJRtlaP8ctAI"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"
            >
              Read this on Google <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="transition-all duration-700 opacity-0 translate-y-6"
          >
            <h2 className="text-3xl font-bold">Find Us</h2>
            <p className="mt-2 text-gray-600 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> NaiUdaan Library —
              Singh More, Hatiya (First Floor)
            </p>
          </div>
          <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 bg-white">
            {/* Using a Google Maps search embed to avoid exposing an API key */}
            <iframe
              title="NaiUdaan Library Location"
              className="w-full h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=NaiUdaan%20Library%20Singh%20More%20Hatiya&output=embed`}
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600">
              © {new Date().getFullYear()} NaiUdaan Library
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://share.google/uO9KCuJRtlaP8ctAI"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Leave a Review <Star className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
