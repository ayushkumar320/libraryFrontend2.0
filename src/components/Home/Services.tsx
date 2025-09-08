import React from "react";

const services = [
  {
    title: "Book Lending",
    description: "Borrow from a wide range of books and magazines for all ages.",
    icon: "📚",
  },
  {
    title: "Reading Room",
    description: "Quiet, air-conditioned reading spaces for focused study.",
    icon: "🪑",
  },
  {
    title: "Events & Workshops",
    description: "Regular events, workshops, and guest lectures for members.",
    icon: "🎤",
  },
  {
    title: "Free Wi-Fi",
    description: "High-speed internet access for all visitors.",
    icon: "📶",
  },
];

const Services = () => (
  <section className="py-10 px-4 bg-gray-50 rounded-lg shadow mb-8">
    <h2 className="text-2xl font-bold mb-4 text-slate-800">Our Services</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {services.map((service, idx) => (
        <div key={idx} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
          <span className="text-3xl">{service.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{service.title}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Services;
