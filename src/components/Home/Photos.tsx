// ...existing code...

const photos = [
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
];

const Photos = () => (
  <section className="py-10 px-4 mb-8 bg-white rounded-lg shadow">
    <h2 className="text-2xl font-bold mb-4 text-slate-800">Gallery</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {photos.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`Library view ${idx + 1}`}
          className="rounded-lg shadow-md object-cover w-full h-56 bg-gray-100"
        />
      ))}
    </div>
  </section>
);

export default Photos;
