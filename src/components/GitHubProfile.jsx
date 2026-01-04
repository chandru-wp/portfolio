import { useState, useEffect } from 'react';

export default function GitHubProfile() {
  const [profile, setProfile] = useState(null);
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
        console.error('GitHub profile fetch error:', err);
        setError('Unable to load GitHub profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section className="relative min-h-screen py-28 bg-gradient-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading GitHub profile...</p>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="relative min-h-screen py-28 bg-gradient-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error || 'Profile not found'}</p>
      </section>
    );
  }

  return (
    <section
      id="github-profile"
      className="relative min-h-screen py-28 bg-gradient-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe] overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl p-12 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Avatar & Basic Info */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-8">
                <img
                  src={profile.avatar_url}
                  alt={profile.name || profile.login}
                  className="w-48 h-48 rounded-full border-4 border-gradient-to-r border-blue-600 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110"
                />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">
                {profile.name || profile.login}
              </h2>
              <p className="text-blue-600 font-bold text-xl mb-4">@{profile.login}</p>

              {profile.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm">
                  {profile.bio}
                </p>
              )}

              {profile.location && (
                <p className="text-gray-600 text-sm mb-6">📍 {profile.location}</p>
              )}

              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Visit GitHub Profile
              </a>
            </div>

            {/* Right: Stats */}
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-5">
                {/* Public Repos */}
                <div className="p-5 bg-blue-100 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all text-center">
                  <p className="text-4xl font-black text-blue-600 mb-1">
                    {profile.public_repos}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider">Public Repos</p>
                </div>

                {/* Followers */}
                <div className="p-5 bg-purple-100 rounded-2xl border-2 border-purple-200 hover:shadow-lg transition-all text-center">
                  <p className="text-4xl font-black text-purple-600 mb-1">
                    {profile.followers}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider">Followers</p>
                </div>

                {/* Following */}
                <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all text-center">
                  <p className="text-4xl font-black text-blue-500 mb-1">
                    {profile.following}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider">Following</p>
                </div>

                {/* Gists */}
                <div className="p-5 bg-pink-100 rounded-2xl border-2 border-pink-200 hover:shadow-lg transition-all text-center">
                  <p className="text-4xl font-black text-pink-600 mb-1">
                    {profile.public_gists}
                  </p>
                  <p className="text-xs text-gray-700 font-bold uppercase tracking-wider">Gists</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-5">
                <div className="p-5 bg-white/70 rounded-2xl border-2 border-white/50 text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Account Created</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="p-5 bg-white/70 rounded-2xl border-2 border-white/50 text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Last Updated</p>
                  <p className="text-lg font-bold text-gray-900">
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
      </div>
    </section>
  );
}
