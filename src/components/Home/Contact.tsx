import React from "react";

const Contact = () => (
  <section className="py-10 px-4 bg-white rounded-lg shadow mb-8">
    <h2 className="text-2xl font-bold mb-4 text-slate-800">Contact Us</h2>
    <div className="space-y-2 text-gray-700">
      <div><span className="font-semibold">Phone:</span> +91 98765 43210</div>
      <div><span className="font-semibold">Email:</span> info@naiudaanlibrary.com</div>
      <div><span className="font-semibold">Address:</span> 123 Main Street, Near City Park, New Delhi, India</div>
    </div>
    <div className="mt-4">
      <a href="mailto:info@naiudaanlibrary.com" className="text-blue-600 hover:underline">Send us an email</a>
    </div>
  </section>
);

export default Contact;
