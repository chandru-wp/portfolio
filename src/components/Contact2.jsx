import { useState } from 'react';
import LoginRegister from './LoginRegister';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const [showAuth, setShowAuth] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const { user, logout } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = () => {
    if (formData.subject && formData.message) {
      console.log('Message sent:', formData);
      setFormData({ subject: '', message: '' });
      alert('Message sent successfully!');
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen flex items-center justify-center 
                 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden"
    >
      {/* --- BACKGROUND GLOWS --- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/10 
                        blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/10 
                        blur-[150px] rounded-full"></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative max-w-3xl mx-auto px-6 text-center w-full">
        
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 animate-fadeIn">
          Get In Touch
        </h2>

        <p className="text-lg text-gray-600 mb-12 animate-fadeIn delay-100">
          Have a project in mind or just want to connect? I'm always open to discussing new ideas and opportunities.
        </p>

        {user ? (
          <div className="space-y-8 bg-white rounded-3xl p-8 md:p-12 shadow-lg">
            {/* User Welcome */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-gray-600">Welcome <span className="font-bold text-gray-900">{user.username}</span> !</p>
                <p className="text-sm text-gray-500">Please fill out the form below to get in touch.</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-4">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-6 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400 transition"
              />
              
              <textarea
                name="message"
                placeholder="Your message..."
                value={formData.message}
                onChange={handleInputChange}
                rows="6"
                className="w-full px-6 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400 resize-none transition"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              Send Message
            </button>

            {/* Sign Out */}
            <button
              onClick={logout}
              className="text-blue-600 hover:text-blue-700 font-semibold transition"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg max-w-md mx-auto">
            <p className="text-gray-600 mb-6">Please log in or register to send a message.</p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Login or Register
            </button>
          </div>
        )}
      </div>

      {/* Login/Register Modal */}
      {showAuth && <LoginRegister onClose={() => setShowAuth(false)} />}
    </section>
  );
}
