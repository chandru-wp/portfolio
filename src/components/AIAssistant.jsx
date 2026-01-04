import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiImage from '../assets/ai_image.png';
import { profileAPI, skillsAPI, experienceAPI, educationAPI, portfolioAPI } from '../services/api';
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

        const skillMap = {
          frontend: skills.find((s) => s.category?.toLowerCase().includes('front'))?.items || portfolioKnowledge.skills.frontend,
          backend: skills.find((s) => s.category?.toLowerCase().includes('back'))?.items || portfolioKnowledge.skills.backend,
          database: skills.find((s) => s.category?.toLowerCase().includes('database'))?.items || portfolioKnowledge.skills.database,
          cloud: skills.find((s) => s.category?.toLowerCase().includes('cloud'))?.items || portfolioKnowledge.skills.cloud,
          aiml: skills.find((s) => s.category?.toLowerCase().includes('ai'))?.items || portfolioKnowledge.skills.aiml,
        };

        setPortfolioKnowledge((prev) => ({
          ...prev,
          name: profile?.name || prev.name,
          email: profile?.email || prev.email,
          phone: profile?.phone || prev.phone,
          about: profile?.about || prev.about,
          skills: skillMap,
          experience: exp || prev.experience,
          education: edu || prev.education,
          projects: projects?.map((p) => ({
            name: p.title,
            description: p.description,
            github: p.github,
            website: p.website,
            status: 'Completed'
          })) || prev.projects
        }));
      } catch (err) {
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
      .replace(/[🎨⚙️💾☁️🤖]/g, '')
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

  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return `Hello${user ? ` ${user.username}` : ''}! 👋 I'm here to tell you about Chandru's portfolio. You can ask me about:\n\n• Skills and technologies\n• Work experience\n• Projects\n• Education\n• Contact information\n\nWhat would you like to know?`;
    }

    // Skills
    if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('tech stack')) {
      const skills = portfolioKnowledge.skills || {};
      const frontend = skills.frontend || [];
      const backend = skills.backend || [];
      const database = skills.database || [];
      const cloud = skills.cloud || [];
      const aiml = skills.aiml || [];

      if (!frontend.length && !backend.length && !database.length && !cloud.length && !aiml.length) {
        return "I'm still loading skills from the server. Please try again in a moment.";
      }

      return `Here are Chandru's skills:\n\n🎨 Frontend: ${frontend.join(', ')}\n\n⚙️ Backend: ${backend.join(', ')}\n\n💾 Database: ${database.join(', ')}\n\n☁️ Cloud: ${cloud.join(', ')}\n\n🤖 AI/ML: ${aiml.join(', ')}`;
    }

    // Experience
    if (lowerMessage.includes('experience') || lowerMessage.includes('work') || lowerMessage.includes('job')) {
      return `Here's Chandru's work experience:\n\n${portfolioKnowledge.experience.map(exp => 
        `📍 ${exp.role} at ${exp.company}\n${exp.duration}\n${exp.description}\nTech: ${exp.tech.join(', ')}`
      ).join('\n\n')}`;
    }

    // Projects
    if (lowerMessage.includes('project')) {
      if (lowerMessage.includes('uptimeeye')) {
        const project = portfolioKnowledge.projects[0];
        return `🚀 ${project.name}\n\nType: ${project.type}\nStatus: ${project.status}\n\n${project.description}\n\nKey Features:\n${project.features.map(f => `• ${f}`).join('\n')}`;
      }
      if (lowerMessage.includes('rydirect')) {
        const project = portfolioKnowledge.projects[1];
        return `🔗 ${project.name}\n\nType: ${project.type}\nStatus: ${project.status}\n\n${project.description}\n\nKey Features:\n${project.features.map(f => `• ${f}`).join('\n')}`;
      }
      if (lowerMessage.includes('mymind') || lowerMessage.includes('nyra')) {
        const project = portfolioKnowledge.projects[2];
        return `🤖 ${project.name}\n\nType: ${project.type}\nStatus: ${project.status}\n\n${project.description}\n\nKey Features:\n${project.features.map(f => `• ${f}`).join('\n')}`;
      }
      return `Here are Chandru's notable projects:\n\n${portfolioKnowledge.projects.map((proj, idx) => 
        `${idx + 1}. ${proj.name} (${proj.type})\n   ${proj.description}\n   Status: ${proj.status}`
      ).join('\n\n')}\n\nAsk about a specific project for more details!`;
    }

    // Education
    if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('college') || lowerMessage.includes('study')) {
      return `📚 Education:\n\n${portfolioKnowledge.education.map(edu => 
        `🎓 ${edu.degree}\n${edu.institution} (${edu.year})${edu.cgpa ? `\nCGPA: ${edu.cgpa}` : ''}\nHighlights: ${edu.highlights.join(', ')}`
      ).join('\n\n')}`;
    }

    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('reach')) {
      return `📞 Contact Information:\n\n📧 Email: ${portfolioKnowledge.email}\n📱 Phone: ${portfolioKnowledge.phone}\n\nFeel free to reach out for collaborations or opportunities!`;
    }

    // About
    if (lowerMessage.includes('about') || lowerMessage.includes('who') || lowerMessage.includes('introduce')) {
      return `👤 About ${portfolioKnowledge.name}:\n\n${portfolioKnowledge.about}\n\n${portfolioKnowledge.email}\n${portfolioKnowledge.phone}`;
    }

    // Default response
    return `I can help you learn about:\n\n• 💼 Work Experience\n• 🚀 Projects (UptimeEye, Rydirect, MyMind)\n• 🛠️ Skills & Technologies\n• 🎓 Education\n• 📞 Contact Information\n\nJust ask me anything specific!`;
  };

  const handleSend = (forcedMessage) => {
    const text = (forcedMessage ?? input).trim();
    if (!text) return;

    const userMessage = text;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    stopListening();
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
      
      // Speak the response
      speakText(response);
    }, 500);
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
