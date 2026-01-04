import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiImage from '../assets/ai_image.png';
import { profileAPI, skillsAPI, experienceAPI, educationAPI, portfolioAPI, aiAPI } from '../services/api';
export default function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Neurova AI. I can help you learn about Chandru's projects, skills, and experience. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { user } = useAuth();

  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

  const [portfolioKnowledge, setPortfolioKnowledge] = useState({
    name: "",
    email: "",
    phone: "",
    about: "",
    skills: {},
    experience: [],
    education: [],
    projects: []
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load portfolio knowledge from backend
  useEffect(() => {
    const loadKnowledge = async () => {
      setLoadingData(true);
      try {
        const [profile, skills, exp, edu, projects] = await Promise.all([
          profileAPI.get(),
          skillsAPI.getAll(),
          experienceAPI.getAll(),
          educationAPI.getAll(),
          portfolioAPI.getAll()
        ]);

        // Build skills map from all skill groups, not just specific categories
        const skillMap = {};
        if (skills && Array.isArray(skills)) {
          skills.forEach(skillGroup => {
            const category = skillGroup.category?.toLowerCase() || 'other';
            skillMap[category] = skillGroup.items || [];
          });
        }

        setPortfolioKnowledge((prev) => ({
          ...prev,
          name: profile?.name || prev.name,
          email: profile?.email || prev.email,
          phone: profile?.phone || prev.phone,
          about: profile?.about || prev.about,
          skills: skillMap,
          allSkillGroups: skills || [], // Store all skill groups for AI to display
          experience: exp || prev.experience,
          education: edu || prev.education,
          projects: projects || prev.projects
        }));
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        // Keep defaults on failure
      } finally {
        setLoadingData(false);
      }
    };

    loadKnowledge();
  }, []);

  // Stop speaking when component unmounts or closes
  useEffect(() => {
    return () => {
      speechSynthesis?.cancel();
      recognitionRef.current?.stop?.();
    };
  }, []);

  // Load voices when available
  useEffect(() => {
    if (speechSynthesis) {
      speechSynthesis.getVoices();
    }
    if (!SpeechRecognition) setMicSupported(false);
  }, []);

  const speakText = (text) => {
    // Stop any ongoing speech
    if (!speechSynthesis) return;
    speechSynthesis.cancel();
    
    // Strip icons/emojis from spoken text so only content is read aloud
    const sanitized = (text || '')
      .replace(/[🎨⚙️💾☁️✨ 🤖]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(sanitized || text);
    
    // Set voice to male (prefer male voice if available)
    const voices = speechSynthesis.getVoices();
    const maleVoice = voices.find(voice => 
      voice.name.includes('Male') || 
      voice.name.includes('David') || 
      voice.name.includes('Mark') ||
      voice.name.includes('Google UK English Male') ||
      voice.name.includes('Microsoft David')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  // Auto-speak the greeting once when the assistant opens
  useEffect(() => {
    if (isOpen && !hasGreeted && messages[0]?.role === 'assistant') {
      speakText(messages[0].content);
      setHasGreeted(true);
    }
    if (!isOpen) {
      setHasGreeted(false);
    }
  }, [isOpen, hasGreeted, messages]);

  const stopSpeaking = () => {
    speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setIsListening(false);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      setMicSupported(false);
      setMicError('Mic not supported in this browser.');
      return;
    }

    try {
      // Fresh instance each time avoids bad states after stop/errors
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setMicError('');
        setIsListening(true);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        setIsListening(false);
        setMicError(event.error === 'not-allowed'
          ? 'Mic permission blocked. Allow access and retry.'
          : 'Mic unavailable. Check permissions and try again.');
      };
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setInput(transcript);
        // Auto-send on final result
        if (event.results[event.results.length - 1].isFinal) {
          setTimeout(() => handleSend(transcript), 100);
        }
      };

      recognition.start();
    } catch (err) {
      setMicError('Mic failed to start. Check browser permission.');
      setIsListening(false);
    }
  };

  const generateResponse = async (userMessage) => {
    try {
      // Prepare context from portfolio knowledge
      const context = {
        portfolioData: portfolioKnowledge,
        userName: user?.username,
      };

      // Call the backend AI API
      const result = await aiAPI.query(userMessage, context);
      return result.answer || "I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('AI Response error:', error);
      // Fallback to local response generation if API fails
      return generateLocalResponse(userMessage);
    }
  };

  const generateLocalResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return `Hello${user ? ` ${user.username}` : ''}! 👋 I'm here to tell you about Chandru's portfolio. You can ask me about:\n\n• Skills and technologies\n• Work experience\n• Projects\n• Education\n• Contact information\n\nWhat would you like to know?`;
    }

    // Skills - Display all skill groups from database
    if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('tech stack')) {
      let skillResponse = `Here are Chandru's skills:\n\n`;
      
      // Use all skill groups from database if available
      if (portfolioKnowledge.allSkillGroups && Array.isArray(portfolioKnowledge.allSkillGroups) && portfolioKnowledge.allSkillGroups.length > 0) {
        portfolioKnowledge.allSkillGroups.forEach(skillGroup => {
          const categoryLower = skillGroup.category?.toLowerCase() || '';
          let emoji = '✨';
          
          // Assign emoji based on category
          if (categoryLower.includes('front')) emoji = '🎨';
          else if (categoryLower.includes('back')) emoji = '⚙️';
          else if (categoryLower.includes('database') || categoryLower.includes('db')) emoji = '💾';
          else if (categoryLower.includes('cloud')) emoji = '☁️';
          else if (categoryLower.includes('ai') || categoryLower.includes('ml')) emoji = '🤖';
          else if (categoryLower.includes('tool') || categoryLower.includes('dev')) emoji = '🔧';
          
          const items = skillGroup.items && Array.isArray(skillGroup.items) ? skillGroup.items.join(', ') : 'N/A';
          skillResponse += `${emoji} ${skillGroup.category}: ${items}\n`;
        });
      } else {
        // Fallback to skills map
        const skills = portfolioKnowledge.skills || {};
        const skillEmojis = {
          'frontend': '🎨',
          'backend': '⚙️',
          'database': '💾',
          'cloud': '☁️',
          'aiml': '🤖'
        };
        
        Object.entries(skills).forEach(([category, items]) => {
          if (Array.isArray(items) && items.length > 0) {
            const emoji = skillEmojis[category] || '✨';
            skillResponse += `${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${items.join(', ')}\n`;
          }
        });
        
        // If still empty, show defaults
        if (skillResponse === `Here are Chandru's skills:\n\n`) {
          skillResponse += `🎨 Frontend: React, JavaScript, Tailwind CSS, Vite, TypeScript, HTML, CSS\n⚙️ Backend: Node.js, Express, Python, Flask, Firebase\n💾 Database: PostgreSQL, MongoDB\n🤖 AI/ML: Machine Learning, Data Science`;
        }
      }
      
      return skillResponse;
    }

    // Experience - Display from database
    if (lowerMessage.includes('experience') || lowerMessage.includes('work') || lowerMessage.includes('job')) {
      if (portfolioKnowledge.experience && Array.isArray(portfolioKnowledge.experience) && portfolioKnowledge.experience.length > 0) {
        let expResponse = `Here's Chandru's work experience:\n\n`;
        portfolioKnowledge.experience.forEach((exp, idx) => {
          expResponse += `${idx + 1}. 📍 ${exp.role} at ${exp.company}\n`;
          if (exp.duration) expResponse += `   ⏱️ ${exp.duration}\n`;
          if (exp.description) expResponse += `   📋 ${exp.description}\n`;
          if (exp.tech && Array.isArray(exp.tech)) expResponse += `   🛠️ Tech: ${exp.tech.join(', ')}\n`;
          expResponse += '\n';
        });
        return expResponse;
      }
      return `💼 Chandru has experience in:\n\n• Full-stack web development\n• Backend system architecture\n• Frontend development with React\n• Database design and optimization\n• Cloud deployment\n• API development\n\nWell-equipped to handle complex projects!`;
    }

    // Projects - Display from database
    if (lowerMessage.includes('project')) {
      if (portfolioKnowledge.projects && Array.isArray(portfolioKnowledge.projects) && portfolioKnowledge.projects.length > 0) {
        let projResponse = `Here are Chandru's projects:\n\n`;
        portfolioKnowledge.projects.forEach((proj, idx) => {
          projResponse += `${idx + 1}. 🚀 ${proj.title || proj.name}\n`;
          if (proj.description) projResponse += `   📝 ${proj.description}\n`;
          if (proj.tech && Array.isArray(proj.tech)) projResponse += `   🛠️ Tech: ${proj.tech.join(', ')}\n`;
          if (proj.github) projResponse += `   🐙 GitHub: ${proj.github}\n`;
          if (proj.website) projResponse += `   🌐 Website: ${proj.website}\n`;
          projResponse += '\n';
        });
        return projResponse;
      }
      return `Here are Chandru's notable projects:\n\n1. 🚀 UptimeEye - Uptime monitoring platform\n2. 🔗 Rydirect - URL shortening service\n3. 🤖 MyMind (NYRA) - AI-powered assistant\n\nEach demonstrates full-stack expertise!`;
    }

    // Education - Display from database
    if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('college') || lowerMessage.includes('study') || lowerMessage.includes('university')) {
      if (portfolioKnowledge.education && Array.isArray(portfolioKnowledge.education) && portfolioKnowledge.education.length > 0) {
        let eduResponse = `📚 Chandru's Education:\n\n`;
        portfolioKnowledge.education.forEach((edu, idx) => {
          eduResponse += `${idx + 1}. 🎓 ${edu.degree}\n`;
          if (edu.institution) eduResponse += `   🏫 ${edu.institution}\n`;
          if (edu.year) eduResponse += `   📅 ${edu.year}\n`;
          if (edu.cgpa) eduResponse += `   ⭐ CGPA: ${edu.cgpa}\n`;
          if (edu.highlights && Array.isArray(edu.highlights)) eduResponse += `   🏆 Highlights: ${edu.highlights.join(', ')}\n`;
          eduResponse += '\n';
        });
        return eduResponse;
      }
      return `📚 Education & Learning:\n\n• Strong academic background\n• Continuous learning in new technologies\n• Self-taught through real-world projects\n• Active in tech communities\n\nFocuses on practical, hands-on learning!`;
    }

    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach') || lowerMessage.includes('hire')) {
      let contactInfo = `📞 Contact Information:\n\n`;
      if (portfolioKnowledge.email) contactInfo += `📧 Email: ${portfolioKnowledge.email}\n`;
      if (portfolioKnowledge.phone) contactInfo += `📱 Phone: ${portfolioKnowledge.phone}\n`;
      contactInfo += `\n💼 Available for: Freelance, Full-time, Consultations, Mentoring\n\nFeel free to reach out!`;
      return contactInfo;
    }

    // About
    if (lowerMessage.includes('about') || lowerMessage.includes('who') || lowerMessage.includes('introduce') || lowerMessage.includes('bio')) {
      let aboutResponse = `👤 About ${portfolioKnowledge.name || 'Chandru'}:\n\n`;
      if (portfolioKnowledge.about) {
        aboutResponse += `${portfolioKnowledge.about}\n\n`;
      } else {
        aboutResponse += `Full-stack developer passionate about building scalable applications and solving complex technical problems.\n\n`;
      }
      if (portfolioKnowledge.email) aboutResponse += `📧 ${portfolioKnowledge.email}\n`;
      if (portfolioKnowledge.phone) aboutResponse += `📱 ${portfolioKnowledge.phone}\n`;
      return aboutResponse;
    }

    // Help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      return `🤖 I can help you learn about:\n\n• 💼 Work Experience\n• 🚀 Projects\n• 🛠️ Skills & Technologies\n• 🎓 Education\n• 📞 Contact Information\n\nJust ask me anything specific!`;
    }

    // Default response
    return `I can help you learn about:\n\n• 💼 Work Experience\n• 🚀 Projects\n• 🛠️ Skills & Technologies\n• 🎓 Education\n• 📞 Contact Information\n\nJust ask me anything specific!`;
  };

  const handleSend = async (forcedMessage) => {
    const text = (forcedMessage ?? input).trim();
    if (!text) return;

    const userMessage = text;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    stopListening();
    setIsTyping(true);

    try {
      const response = await generateResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Speak the response
      speakText(response);
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorResponse = "Sorry, I encountered an error processing your question. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorResponse }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[620px] bg-white flex flex-col z-50 shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-5 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0m-9 5h.01M9 9h.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Neurova AI</h3>
            <p className="text-xs opacity-90">Portfolio Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice Control Button */}
          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              title="Stop speaking"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => messages.length > 0 && speakText(messages[messages.length - 1].content)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              title="Speak last message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
            {msg.role === 'assistant' && (
              <button
                onClick={() => speakText(msg.content)}
                className="text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200 p-2 rounded-lg self-start"
                title="Speak this message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 ml-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          {isListening ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Listening...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
              🎙️ Tap mic to speak
            </span>
          )}
          {!micSupported && (
            <span className="text-red-500 font-medium">Mic not supported</span>
          )}
          {micError && (
            <span className="inline-flex items-center gap-2 text-red-500">
              {micError}
              <button 
                onClick={() => setMicError('')}
                className="hover:text-red-700 text-xs underline"
              >
                Dismiss
              </button>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!micSupported}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} ${!micSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? '⏹' : '🎙️'}
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
