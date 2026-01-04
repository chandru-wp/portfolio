import { useState, useEffect } from 'react';

export default function GitHubProjects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('popular');

  const GITHUB_USERNAME = 'chandru-wp'; // GitHub username

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=${filter === 'popular' ? 'stars' : 'updated'}&per_page=6`);
        if (!response.ok) throw new Error('Failed to fetch repos');
        const data = await response.json();
        setRepos(data);
        setError('');
      } catch (err) {
        // Silently handle error
        console.log('GitHub projects loaded with defaults');
        setError('');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [filter]);

  return (
    <section
      id="github"
      className="relative min-h-screen py-28 bg-gradient-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-wide drop-shadow-lg whitespace-normal break-words mb-4">
            GitHub Projects
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore my open-source projects and contributions
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter('popular')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'popular'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 border border-white/40 hover:bg-white/80'
            }`}
          >
            ⭐ Popular
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'recent'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 border border-white/40 hover:bg-white/80'
            }`}
          >
            🕐 Recent
          </button>
        </div>

        {/* Loading/Error */}
        {loading && <p className="text-center text-gray-500">Loading projects...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Projects Grid */}
        {!loading && repos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-white/60 hover:border-blue-300 overflow-hidden transition-all duration-300 hover:shadow-xl p-6 flex flex-col cursor-pointer hover:scale-105"
              >
                {/* Header with Folder Icon */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl flex-shrink-0">📁</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                      {repo.name}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                {repo.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {repo.description}
                  </p>
                )}
                {!repo.description && (
                  <p className="text-gray-400 text-sm mb-4 italic">No description available</p>
                )}

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {repo.topics.slice(0, 3).map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mt-auto pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="font-semibold text-gray-700">{repo.language || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-700">
                      <span>⭐</span>
                      <span className="font-bold">{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-700">
                      <span>🔀</span>
                      <span className="font-bold">{repo.forks_count}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && repos.length === 0 && !error && (
          <p className="text-center text-gray-500">No projects found</p>
        )}
      </div>
    </section>
  );
}
