import Navbar from "./Navbar";
import Location from "./Location";
import Photos from "./Photos";
import Services from "./Services";
import Contact from "./Contact";

const HomeView = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <main className="max-w-4xl mx-auto py-8 px-2">
      <Photos />
      <Location />
      <Services />
      <Contact />
    </main>
  </div>
);

export default HomeView;
