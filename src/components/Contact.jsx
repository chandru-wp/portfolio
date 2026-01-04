 import { useState } from 'react';
import LoginRegister from './LoginRegister';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const [showAuth, setShowAuth] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [messages, setMessages] = useState([
    { id: 1, username: 'user123', subject: 'Great work!', message: 'Love your portfolio', replied: false, reply: null },
    { id: 2, username: 'john_dev', subject: 'Collaboration', message: 'Interested in working together', replied: false, reply: null },
  ]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const { user, logout, isAdmin } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = () => {
    if (formData.subject && formData.message) {
      const newMessage = {
        id: messages.length + 1,
        username: user.username,
        subject: formData.subject,
        message: formData.message,
        replied: false,
        reply: null
      };
      setMessages([newMessage, ...messages]);
      setFormData({ subject: '', message: '' });
      alert('Message sent successfully!');
    }
  };

  const handleReply = (messageId) => {
    if (replyText.trim()) {
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, reply: replyText, replied: true }
          : msg
      ));
      setReplyingTo(null);
      setReplyText('');
    }
  };

  const handleEditReply = (messageId) => {
    if (editReplyText.trim()) {
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, reply: editReplyText }
          : msg
      ));
      setEditingReply(null);
      setEditReplyText('');
    }
  };

  const handleDeleteReply = (messageId) => {
    if (confirm('Are you sure you want to delete this reply?')) {
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, reply: null, replied: false }
          : msg
      ));
      setEditingReply(null);
      setEditReplyText('');
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen flex items-center justify-center 
                 bg-gradient-to-b from-[#eef3ff] via-[#e8edff] to-[#dbeafe] overflow-hidden"
    >
      {/* --- BACKGROUND GLOWS --- */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 
                        blur-[150px] rounded-full"></div>

        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 
                        blur-[150px] rounded-full"></div>
      </div>

      {/* --- GLASS RING EFFECT --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full border border-white/40 
                        backdrop-blur-xl opacity-40 animate-rotateSlow"></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative max-w-2xl mx-auto px-6 text-center">

        <h2 className="text-6xl font-extrabold bg-gradient-to-r
                       from-blue-600 via-indigo-600 to-purple-600 
                       bg-clip-text text-transparent drop-shadow-lg animate-fadeIn">
          Get In Touch
        </h2>

        <p className="text-gray-700 mt-5 text-xl animate-fadeIn delay-200">
          Let’s connect and build something amazing together.
        </p>

        {user ? (
          isAdmin ? (
            // ADMIN VIEW - Show Messages
            <div className="mt-10 space-y-6 max-w-4xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Messages from Users</h3>
                <button 
                  onClick={logout}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95">
                  Logout
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border-l-4 border-blue-500 hover:shadow-xl hover:bg-white/80 transition-all duration-300 border border-blue-100/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{msg.username}</p>
                          <p className="text-sm text-gray-600 font-medium">{msg.subject}</p>
                        </div>
                        <span className={`text-xs px-4 py-2 rounded-full font-bold shadow-sm ${msg.replied ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200'}`}>
                          {msg.replied ? '✓ Replied' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4 font-medium">{msg.message}</p>
                      
                      {msg.replied && msg.reply && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 mb-4 rounded-xl border border-green-100">
                          {editingReply === msg.id ? (
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-green-900 mb-1">Edit Your Reply:</p>
                              <textarea
                                value={editReplyText}
                                onChange={(e) => setEditReplyText(e.target.value)}
                                placeholder="Edit your reply..."
                                rows="3"
                                className="w-full px-4 py-3 rounded-lg border-2 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none text-gray-900 resize-none font-medium"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditReply(msg.id)}
                                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingReply(null);
                                    setEditReplyText('');
                                  }}
                                  className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-bold text-green-900 mb-2 uppercase tracking-wider">Your Reply:</p>
                              <p className="text-green-800 mb-4 font-medium leading-relaxed">{msg.reply}</p>
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => {
                                    setEditingReply(msg.id);
                                    setEditReplyText(msg.reply);
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReply(msg.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {!msg.replied && (
                        <>
                          {replyingTo === msg.id ? (
                            <div className="space-y-3 mt-4 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply here..."
                                rows="3"
                                className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-900 resize-none font-medium"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReply(msg.id)}
                                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                  Send Reply
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                  className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingTo(msg.id)}
                              className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
                            >
                              Reply to Message
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No messages yet</p>
                )}
              </div>
            </div>
          ) : (
            // NORMAL USER VIEW - Show Contact Form
            <div className="space-y-8 mt-10 bg-white rounded-3xl p-8 md:p-12 shadow-lg">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Welcome <span className="font-bold text-gray-900">{user.username}</span> !</p>
                  <p className="text-sm text-gray-500">Please fill out the form below to get in touch.</p>
                </div>
              </div>

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

              <button
                onClick={handleSendMessage}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                Send Message
              </button>

              <button
                onClick={logout}
                className="text-blue-600 hover:text-blue-700 font-semibold transition"
              >
                Sign out
              </button>
            </div>
          )
        ) : (
          <button 
            onClick={() => setShowAuth(true)}
            className="mt-10 px-10 py-4 
                       bg-linear-to-r from-blue-600 to-indigo-600
                       text-white rounded-2xl text-lg font-semibold shadow-xl
                       hover:scale-110 hover:shadow-2xl active:scale-95
                       transition-all duration-300 animate-fadeIn delay-300">
            Login or Register
          </button>
        )}
      </div>

      {/* Login/Register Modal */}
      {showAuth && <LoginRegister onClose={() => setShowAuth(false)} />}
 

    </section>
  );
}
