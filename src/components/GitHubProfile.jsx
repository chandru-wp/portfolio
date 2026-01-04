import { useState, useEffect } from 'react';
import { FiGithub, FiMapPin, FiCode, FiUsers, FiGitBranch, FiStar, FiLinkedin, FiInstagram, FiGlobe } from 'react-icons/fi';

export default function GitHubProfile() {
  const [profile, setProfile] = useState(null);
  const [latestRepo, setLatestRepo] = useState(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const GITHUB_USERNAME = 'chandru-wp';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setError('');
      } catch (err) {
        // Silently handle error
        console.log('GitHub profile loaded with defaults');
        setError('');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section className="relative min-h-screen py-28 bg-linear-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading GitHub profile...</p>
        </div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="relative min-h-screen py-28 bg-linear-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border-2 border-red-200 p-8 max-w-md">
          <p className="text-red-600 text-lg font-semibold text-center">{error || 'Profile not found'}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="github-profile"
      className="relative min-h-screen py-28 bg-linear-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/70 shadow-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Left: Avatar & Basic Info */}
            <div className="lg:col-span-1 flex flex-col items-center text-center">
              <div className="mb-8">
                <div className="relative inline-block">
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || profile.login}
                    className="w-44 h-44 rounded-full border-4 border-blue-500 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                {profile.name || profile.login}
              </h2>
              <p className="text-blue-600 font-bold text-lg mb-4">@{profile.login}</p>

              {profile.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs line-clamp-3">
                  {profile.bio}
                </p>
              )}

              {profile.location && (
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-6">
                  <FiMapPin size={18} />
                  <span>{profile.location}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 w-full">
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700"
                >
                  <FiGithub size={20} />
                  Visit Profile
                </a>

                {/* <button
                  onClick={() => {
                    const el = document.getElementById('about');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    else window.location.hash = '#about';
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  About
                </button> */}

                <button
                  onClick={async () => {
                    try {
                      setRepoLoading(true);
                      setRepoError('');
                      setLatestRepo(null);
                      const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=1`);
                      if (!res.ok) throw new Error('Failed to fetch latest repo');
                      const data = await res.json();
                      if (Array.isArray(data) && data.length > 0) setLatestRepo(data[0]);
                      else setRepoError('No repositories found');
                    } catch (err) {
                      console.error('Latest repo fetch error:', err);
                      setRepoError('Unable to load latest project');
                    } finally {
                      setRepoLoading(false);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <FiCode size={18} />
                  {repoLoading ? 'Loading...' : 'Latest Project'}
                </button>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Public Repos */}
                <div className="group p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all hover:border-blue-400 cursor-pointer">
                  <p className="text-3xl md:text-4xl font-black text-blue-600 mb-2">
                    {profile.public_repos}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <FiGitBranch size={14} /> Repos
                  </p>
                </div>

                {/* Followers */}
                <div className="group p-6 bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 hover:shadow-lg transition-all hover:border-purple-400 cursor-pointer">
                  <p className="text-3xl md:text-4xl font-black text-purple-600 mb-2">
                    {profile.followers}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <FiUsers size={14} /> Followers
                  </p>
                </div>

                {/* Following */}
                <div className="group p-6 bg-linear-to-br from-cyan-50 to-cyan-100 rounded-2xl border-2 border-cyan-200 hover:shadow-lg transition-all hover:border-cyan-400 cursor-pointer">
                  <p className="text-3xl md:text-4xl font-black text-cyan-600 mb-2">
                    {profile.following}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider">Following</p>
                </div>

                {/* Gists */}
                <div className="group p-6 bg-linear-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200 hover:shadow-lg transition-all hover:border-pink-400 cursor-pointer">
                  <p className="text-3xl md:text-4xl font-black text-pink-600 mb-2">
                    {profile.public_gists}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider flex items-center gap-1">
                    <FiStar size={14} /> Gists
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-all hover:border-gray-300">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Account Created</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-all hover:border-gray-300">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Last Updated</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    {new Date(profile.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Inline latest repo preview */}
        {latestRepo && (
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-gray-200 p-6 md:p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCode size={24} className="text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">{latestRepo.name}</h3>
                  </div>
                  {latestRepo.description && (
                    <p className="text-gray-600 mt-2 leading-relaxed">{latestRepo.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 mt-6">
                    <div className="flex items-center gap-2">
                      <FiStar size={16} className="text-yellow-500" />
                      <span className="font-semibold">{latestRepo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiGitBranch size={16} className="text-blue-600" />
                      <span className="font-semibold">{latestRepo.forks_count}</span>
                    </div>
                    {latestRepo.language && (
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {latestRepo.language}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-3 w-full sm:w-auto">
                  <a 
                    href={latestRepo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 text-center"
                  >
                    Open Repo
                  </a>
                  <button 
                    onClick={() => setLatestRepo(null)} 
                    className="text-sm text-gray-500 hover:text-gray-700 font-semibold underline transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-16">
        <div className="bg-linear-to-r from-white/90 to-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Stats */}
            <div className="flex items-center gap-8">
              {/* Followers Stat */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <FiUsers size={20} className="text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{profile.followers}</p>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">Followers</p>
                </div>
              </div>

              {/* Repos Stat */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <FiGitBranch size={20} className="text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{profile.public_repos}</p>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">Repos</p>
                </div>
              </div>

              {/* Gists Stat */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <FiStar size={20} className="text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{profile.public_gists}</p>
                  <p className="text-xs text-gray-600 uppercase tracking-wider">Gists</p>
                </div>
              </div>
            </div>

            {/* Right: Social Links */}
            <div className="flex items-center gap-6">
              {/* GitHub */}
              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 hover:bg-gray-900 text-gray-900 hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                title="GitHub"
              >
                <FiGithub size={22} />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/chandru-kannan-b5919a313/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 hover:bg-blue-600 text-gray-900 hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                title="LinkedIn"
              >
                <FiLinkedin size={22} />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/mr_tamilan_069/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 hover:bg-pink-600 text-gray-900 hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                title="Instagram"
              >
                <FiInstagram size={22} />
              </a>

              {/* Website */}
              <a
                href={profile.blog || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 hover:bg-indigo-600 text-gray-900 hover:text-white rounded-full transition-all duration-300 hover:scale-110"
                title="Website"
              >
                <FiGlobe size={22} />
              </a>
            </div>
          </div>

          {/* Bottom: Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 pt-8 border-t border-gray-200">
            <a
              href="#terms"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms & Conditions
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a
              href="#privacy"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a
              href="#contact"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
