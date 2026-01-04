 import { useState, useEffect } from "react";
import { profileAPI } from "../services/api";
// Replace this import with the path to your Vijay image
import vijayImage from "../assets/thalapathi.png"; // <-- Add your image here

export default function Hero() {
  const titles = ["Full Stack Developer", "Software Tester"];
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const [profile, setProfile] = useState({ name: 'Chandru K', about: 'Tech isn\'t just what I do—it\'s how I think. With AI in my toolkit and full-stack development in my hands, I\'m building systems that solve real-world problems.' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileAPI.get();
        if (data && Object.keys(data).length > 0) {
          setProfile(data);
        }
      } catch (err) {
        console.log('Profile fetch error, using defaults');
      }
    };
    fetchProfile();
  }, []);

  const handleGetInTouch = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fullText = titles[currentTitleIndex];
    let speed = isDeleting ? 100 : 150;
    let timeout;

    if (!isDeleting && index === fullText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1000);
    } else if (isDeleting && index === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
      }, 500);
    } else {
      timeout = setTimeout(() => {
        if (!isDeleting) {
          setDisplayedText(fullText.slice(0, index + 1));
          setIndex(index + 1);
        } else {
          setDisplayedText(fullText.slice(0, index - 1));
          setIndex(index - 1);
        }
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [index, isDeleting, currentTitleIndex, titles]);

  return (
    <section
      id="about"
      className="min-h-screen flex items-center bg-gradient-to-br from-[#e0e7ff] via-[#eef2ff] to-[#dbeafe] pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* LEFT CONTENT */}
        <div className="animate-fadeIn space-y-6 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight drop-shadow-sm whitespace-normal break-words w-full">
            {profile.name || 'Chandru K'}
          </h1>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-2 md:mt-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold tracking-wide whitespace-normal break-words w-full">
            {displayedText}
            <span className="inline-block w-1 bg-blue-100 animate-pulse ml-1">&nbsp;</span>
          </h2>

          <p className="mt-4 md:mt-6 text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl max-w-md md:max-w-lg mx-auto md:mx-0">
            {profile.about || 'Tech isn\'t just what I do—it\'s how I think. With AI in my toolkit and full-stack development in my hands, I\'m building systems that solve real-world problems. I don\'t follow the future—I create it.'}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-5 mt-6 text-xl sm:text-2xl md:text-3xl text-gray-700">
            <a href="https://github.com/" target="_blank" className="hover:text-black transition-transform hover:scale-125"><i className="fa-brands fa-github"></i></a>
            <a href="https://linkedin.com/" target="_blank" className="hover:text-blue-700 transition-transform hover:scale-125"><i className="fa-brands fa-linkedin"></i></a>
            <a href="https://instagram.com/" target="_blank" className="hover:text-pink-500 transition-transform hover:scale-125"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://twitter.com/" target="_blank" className="hover:text-blue-400 transition-transform hover:scale-125"><i className="fa-brands fa-twitter"></i></a>
          </div>

          <div className="mt-6 md:mt-8 flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
            <button onClick={handleGetInTouch} className="px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95">
              Get In Touch
            </button>

            <button className="px-8 py-3 sm:px-10 sm:py-4 bg-blue-500 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-2">
              Resume <span>⬇</span>
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center mt-8 md:mt-0">
          <div className="relative group">
            <div className="absolute inset-0 w-48 sm:w-60 md:w-72 lg:w-80 h-48 sm:h-60 md:h-72 lg:h-80 rounded-full bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 blur-3xl opacity-50 group-hover:opacity-70 transition-all duration-500"></div>
            <img
              src={vijayImage} // <-- Your Vijay image
              alt="Actor Vijay"
              className="relative w-48 sm:w-60 md:w-72 lg:w-80 h-48 sm:h-60 md:h-72 lg:h-80 rounded-full border-4 border-white shadow-2xl object-cover scale-100 group-hover:scale-105 transition-all duration-500"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
