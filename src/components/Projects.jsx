import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { portfolioAPI } from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();

  const palette = [
    ["#9333EA", "#A855F7"],
    ["#7C3AED", "#A855F7"],
    ["#6366F1", "#8B5CF6"],
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await portfolioAPI.getAll();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section
      id="projects"
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

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
          <div className="text-center mb-16 relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-wide drop-shadow-lg animate-fadeIn mb-4 whitespace-normal break-words">Featured Projects</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto animate-fadeIn delay-200">
            From ideas to impact—Click on a project to see a detailed case study.
          </p>
        </div>

        {loading && (
          <div className="text-center mt-14">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading projects...</p>
          </div>
        )}

        {error && !loading && projects.length === 0 && (
          <div className="text-center mt-14 text-red-600">
            <p>Unable to load projects. Please try again later.</p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => {
              const gradient = palette[idx % palette.length];

              return (
                <div
                  key={project.id || project._id || idx}
                  className="group flex flex-col h-full rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                >
                  {/* Card Header with Gradient & Icon */}
                  <div
                    className="relative h-64 w-full overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                    }}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent" />
                    </div>
                    
                    {/* Project Icon */}
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <span className="text-xl">🔗</span>
                    </div>

                    {/* Project Icon in Center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl">
                        <span className="text-4xl">📁</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Black Section */}
                    <div className="bg-black text-white px-6 py-8 text-center">
                    <h3 className="text-xl font-bold mb-2 whitespace-normal break-words min-w-0">{project.title}</h3>
                    <p className="text-sm text-gray-300 mb-4">{project.tagline || "Professional project"}</p>
                    
                    <div className="flex items-center justify-center gap-2 text-xs mb-4">
                      {project.email && (
                        <span className="flex items-center gap-1">
                          <span>✉️</span>
                          {project.email}
                        </span>
                      )}
                    </div>

                    {project.phone && (
                      <div className="text-xs text-gray-400">
                        📱 {project.phone}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-4">
                      © 2025 Design & Developed by Chandru K
                    </div>
                  </div>

                  {/* Card Bottom Info */}
                  <div className="flex-1 px-6 py-6 space-y-4">
                    {/* Category & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                        {project.category || "FULL STACK"}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        {project.status || "Completed"}
                      </span>
                    </div>

                    {/* Project Title */}
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 whitespace-normal break-words">{project.shortTitle || project.title}</h4>
                    </div>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-2">
                      {(project.technologies || ["Full stack"]).slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Footer with avatars and links */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex -space-x-2">
                        {project.team && project.team.length > 0 ? (
                          project.team.slice(0, 2).map((member, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                            >
                              {member.charAt(0).toUpperCase()}
                            </div>
                          ))
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                            C
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 transition"
                          >
                            <span className="text-lg">🔗</span>
                          </a>
                        )}
                        {project.website && (
                          <a
                            href={project.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 transition"
                          >
                            <span className="text-lg">↗️</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isAdmin && (
          <div className="text-center mt-12">
            <button
              onClick={() => (window.location.pathname = '/admin')}
              className="px-6 py-2 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
            >
              ✏️ Edit Projects
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
