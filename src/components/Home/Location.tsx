import React from "react";

const Location = () => (
  <section className="py-10 px-4 bg-gray-50 rounded-lg shadow mb-8">
    <h2 className="text-2xl font-bold mb-2 text-slate-800">Location</h2>
    <p className="text-gray-700 mb-2">123 Main Street, Near City Park, New Delhi, India</p>
    <iframe
      title="Library Location"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14014.123456789!2d77.216721!3d28.644800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3a123456789%3A0xabcdefabcdefabcd!2sConnaught+Place!5e0!3m2!1sen!2sin!4v1630000000000!5m2!1sen!2sin"
      width="100%"
      height="250"
      style={{ border: 0 }}
      allowFullScreen={true}
      loading="lazy"
      className="rounded-lg border"
    ></iframe>
  </section>
);

export default Location;
