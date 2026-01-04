import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginRegister({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        console.log('Attempting login...', { username: formData.username });
        const result = await login(formData.username, formData.password);
        console.log('Login result:', result);
        if (result.success) {
          setSuccess('Login successful!');
          setTimeout(() => {
            if (onClose) onClose();
          }, 1000);
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        console.log('Attempting registration...', { username: formData.username, role: formData.role });
        const result = await register(formData.username, formData.password, formData.role);
        console.log('Registration result:', result);
        if (result.success) {
          setSuccess('Registration successful! Please login.');
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ username: '', password: '', role: 'user' });
          }, 1500);
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 backdrop-blur-md">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-white/90 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white/70 ring-1 ring-white/60 animate-scaleIn"
      >

        {/* Decorative Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Subtle background flair */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-10 md:p-12">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 backdrop-blur rounded-full transition-all duration-200"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-md">
              <span className="text-xl">🔒</span>
              <span className="text-xs font-bold tracking-wider uppercase text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Secure Access</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-600 text-base font-medium max-w-sm mx-auto">
              {isLogin ? 'Enter your details to access your workspace' : 'Join us and start building your portfolio'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Username Field */}
              <div className="group space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 ml-1">Username</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-450 font-semibold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Enter a  username "
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-450 font-semibold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Enter a  password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50/80 backdrop-blur border-2 border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3 animate-shake shadow-md">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 backdrop-blur border-2 border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-3 shadow-md">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-300 disabled:opacity-70 hover:scale-105 group"
            >
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[15px] py-5 px-6 text-white font-bold text-lg tracking-wider group-hover:shadow-inner transition-all">
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </div>
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-10 text-center pt-8 border-t border-slate-200/50">
            <p className="text-slate-600 font-medium text-base">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2.5 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold hover:from-blue-700 hover:to-purple-700 hover:underline decoration-2 underline-offset-4 transition-all duration-200"
              >
                {isLogin ? 'Sign up now' : 'Log in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
