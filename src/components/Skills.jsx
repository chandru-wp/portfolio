import { useEffect, useState } from 'react';
import { skillsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Skills() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await skillsAPI.getAll();
        // Sort by category order: Database, Frontend, Backend
        const sorted = data.sort((a, b) => {
          const order = { 'Data base': 0, 'Database': 0, 'Frontend': 1, 'Backend': 2 };
          return (order[a.category] ?? 999) - (order[b.category] ?? 999);
        });
        setGroups(sorted);
      } catch (err) {
        console.error('Failed to load skills:', err);
        setError('Unable to load skills from server.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section
      id="skills"
      className="relative min-h-screen py-28 bg-gradient-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] overflow-hidden"
    >
      {/* --- BACKGROUND GLOWS --- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 blur-[150px] rounded-full"></div>
      </div>

      {/* --- GLASS RING EFFECT --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full border border-white/40 backdrop-blur-xl opacity-40 animate-rotateSlow"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        {isAdmin && (
          <div className="text-right mb-4">
            <button onClick={() => (window.location.pathname = '/admin')} className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md">Edit Skills</button>
          </div>
        )}

        {/* Title */}
        <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-wide drop-shadow-lg animate-fadeIn whitespace-normal break-words">
          Technologies & Skills
        </h2>

        <p className="text-gray-600 mt-3 text-lg max-w-xl mx-auto animate-fadeIn delay-200">
          From logic to launch — here are the tools that help me build.
        </p>

        {/* Skill Groups */}
        <div className="mt-16 space-y-16">
          {loading && (
            <p className="text-gray-500">Loading skills...</p>
          )}
          {error && !loading && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          {!loading && groups.map((group) => (
            <SkillGroup key={group.category} title={group.category} skills={group.items} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1s forwards; }
        .delay-200 { animation-delay: 0.2s; }

        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
      `}</style>
    </section>
  );
}

function SkillGroup({ title, skills }) {
  return (
    <div className="animate-fadeInUp">
      {/* Group Title */}
      <h3 className="font-bold text-2xl mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent whitespace-normal break-words">
        {title}
      </h3>

      {/* Skill Pills */}
      <div className="flex flex-wrap justify-center gap-4">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="px-6 py-3 rounded-full text-white font-bold text-sm md:text-base bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 shadow-lg border border-blue-400/30 hover:shadow-2xl hover:scale-110 transition-all duration-300"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
