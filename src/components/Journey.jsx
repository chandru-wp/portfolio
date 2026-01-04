import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaLaptopCode, FaCogs, FaGraduationCap } from "react-icons/fa";
import { experienceAPI, educationAPI } from "../services/api";
import { useAuth } from '../context/AuthContext';

export default function JourneyV2() {
  const [activeTab, setActiveTab] = useState("experience");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [expData, eduData] = await Promise.all([
          experienceAPI.getAll(),
          educationAPI.getAll()
        ]);
        setExperience(expData);
        setEducation(eduData);
      } catch (err) {
        console.error('Failed to load journey data:', err);
        setError('Unable to load journey data from server.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cardAnimation = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section 
    id="journey" className="py-24 relative min-h-screen bg-gradient-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] overflow-hidden">

      {/* --- BACKGROUND GLOWS --- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 blur-[150px] rounded-full"></div>
      </div>

      {/* --- GLASS RING EFFECT --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full border border-white/40 backdrop-blur-xl opacity-40 animate-rotateSlow"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">

        {isAdmin && (
          <div className="text-right mb-4">
            <button onClick={() => (window.location.pathname = '/admin')} className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md">Edit Journey</button>
          </div>
        )}

        <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg animate-fadeIn whitespace-normal break-words">
          My Journey
        </h2>

        {/* Tabs */}
        <div className="bg-white/40 backdrop-blur-xl p-3 rounded-full inline-flex mb-16 shadow-xl border border-white/50">
          {["experience", "education"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                  : "text-gray-700 hover:text-purple-600"
              }`}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-14">
          {loading && (
            <p className="text-gray-500">Loading timeline...</p>
          )}
          {error && !loading && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          {!loading && (activeTab === "experience" ? experience : education).map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardAnimation}
              className="relative p-10 rounded-3xl bg-white/50 backdrop-blur-xl shadow-xl 
                         border border-white/40 hover:shadow-2xl hover:-translate-y-2 
                         transition-all duration-500"
            >
              {/* Icon */}
              <div className="flex items-center gap-6 mb-6">
                <div className="text-4xl p-5 rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
                  {item.icon ? item.icon : activeTab === 'experience' ? <FaLaptopCode /> : <FaGraduationCap />}
                </div>

                <div className="text-left min-w-0">
                  <h3 className="text-2xl font-extrabold text-gray-900 whitespace-normal break-words">{item.role || item.degree}</h3>
                  <p className="text-gray-500">{item.duration || item.year || item.date}</p>
                </div>
              </div>

              {/* Details */}
              <p className="text-indigo-600 font-semibold text-left">{item.company || item.institution}</p>
              <p className="text-gray-700 text-left mt-3 leading-relaxed">{item.description || item.desc}</p>

              <div className="flex flex-wrap gap-2 mt-5">
                {(item.tags || item.highlights || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium rounded-full 
                               bg-linear-to-r from-indigo-50 to-purple-100 text-indigo-700
                               shadow-sm hover:shadow-md hover:scale-105 transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
