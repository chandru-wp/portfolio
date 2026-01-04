import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { portfolioAPI } from "../services/api";
import { FiExternalLink, FiGithub, FiLink2 } from "react-icons/fi";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const [styleMode, setStyleMode] = useState("modern");

  const palette = [
    ["#9333EA", "#A855F7"],
    ["#7C3AED", "#A855F7"],
    ["#6366F1", "#8B5CF6"],
  ];

  // Fetch only from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await portfolioAPI.getAll();
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setError('No projects found on backend');
        }
      } catch (err) {
        setError('Failed to load projects from backend');
        console.error('Projects API Error:', err);
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
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-8 relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="mx-auto sm:mx-0">
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-wide drop-shadow-lg mb-2 whitespace-normal break-words">Featured Projects</h2>
            <p className="text-base text-gray-700 max-w-2xl mx-auto sm:mx-0">From ideas to impact—Click a project to view details.</p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setStyleMode("modern")}
              className={`px-3 py-2 rounded-full font-medium transition ${styleMode === "modern" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "bg-white text-gray-700 border border-gray-200"}`}
            >
              Modern
            </button>
            <button
              onClick={() => setStyleMode("elegant")}
              className={`px-3 py-2 rounded-full font-medium transition ${styleMode === "elegant" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" : "bg-white text-gray-700 border border-gray-200"}`}
            >
              Elegant
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center mt-14">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Loading projects...</p>
          </div>
        )}

        {error && !loading && projects.length === 0 && (
          <div className="text-center mt-14 text-red-600">
            <p>Unable to load projects. Please try again later.</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => {
              const gradient = palette[idx % palette.length];
              return (
                <article key={project.id || project._id || idx} className="group flex flex-col h-full rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 cursor-pointer border border-gray-100">
                  <div className="relative h-56 w-full overflow-hidden" style={{ backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
                    <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 hover:bg-white/30 transition-all">
                      <FiLink2 className="w-5 h-5 text-white" />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">📁</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black text-white px-6 py-6 text-center">
                    <h3 className="text-lg font-bold mb-1 whitespace-normal break-words">{project.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{project.tagline || "Professional project"}</p>
                    <div className="text-xs text-gray-500">© 2025 Design & Developed by Chandru K</div>
                  </div>

                  <div className="flex-1 px-6 py-5 space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-widest text-gray-600 uppercase">{project.category || "FULL STACK"}</span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-200 text-emerald-800">{project.status || "Completed"}</span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-gray-900 whitespace-normal break-words">{project.shortTitle || project.title}</h4>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(project.technologies || ["Full stack"]).slice(0, 2).map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{tech}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex -space-x-2">
                        {project.team && project.team.length > 0 ? (
                          project.team.slice(0, 2).map((member, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">{String(member).charAt(0).toUpperCase()}</div>
                          ))
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">C</div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all" title="View on GitHub">
                            <FiGithub className="w-4 h-4" />
                          </a>
                        )}
                        {project.website && (
                          <a href={project.website} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all" title="Visit website">
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
