import { useState } from 'react';
import { FiTerminal } from 'react-icons/fi';
import AIAssistant from './AIAssistant';
import fbd from '../assets/ai_image.png';

export default function FloatingAIButton() {
  const [showAI, setShowAI] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowAI(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open AI assistant"
        className="fixed bottom-8 right-8 w-20 h-20 rounded-full shadow-2xl hover:scale-125 hover:shadow-3xl transition-transform duration-300 flex items-center justify-center z-40 group overflow-hidden"
        style={{
          animation: 'bounce 2s infinite',
          backgroundImage: `url(${fbd})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
  
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute right-full mr-4 px-4 py-2 bg-gray-900/80 backdrop-blur text-white text-sm rounded-lg whitespace-nowrap">
            Ask AI about my portfolio
            <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-900/80"></div>
          </div>
        )}
      </button>

      {/* AI Assistant Modal */}
      {showAI && <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />}

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </>
  );
}
