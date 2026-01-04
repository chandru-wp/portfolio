import { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaPhone, FaEnvelope } from "react-icons/fa";
import { profileAPI, skillsAPI, experienceAPI, educationAPI, portfolioAPI } from "../services/api";

export default function ResumeModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [profileData, skillsData, experienceData, educationData, projectsData] = await Promise.all([
          profileAPI.get().catch(() => ({})),
          skillsAPI.getAll().catch(() => []),
          experienceAPI.getAll().catch(() => []),
          educationAPI.getAll().catch(() => []),
          portfolioAPI.getAll().catch(() => [])
        ]);

        // Organize skills by category
        const organizedSkills = skillsData.reduce((acc, skill) => {
          if (!skill || !skill.category || !skill.name) return acc;
          
          const existing = acc.find(s => s.category === skill.category);
          if (existing) {
            existing.items.push(skill.name);
          } else {
            acc.push({ category: skill.category, items: [skill.name] });
          }
          return acc;
        }, []);

        console.log('Organized Skills:', organizedSkills);

        // Format experience - ensure all fields are present
        const formattedExperience = experienceData.map(exp => ({
          title: exp.title || exp.role || "",
          company: exp.company || "",
          duration: exp.duration || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
          description: exp.description || ""
        }));

        // Format education - ensure all fields are present
        const formattedEducation = educationData.map(edu => ({
          degree: edu.degree || "",
          field: edu.field || edu.major || "",
          institution: edu.institution || edu.school || "",
          year: edu.year || `${edu.startYear || ''} - ${edu.endYear || 'Present'}`,
          cgpa: edu.cgpa || edu.gpa || ""
        }));

        // Format projects
        const formattedProjects = projectsData.map(project => ({
          name: project.title || project.name || "",
          description: project.description || "",
          tech: project.technologies || project.tech || ""
        }));

        setProfile({
          name: profileData.name || "Chandru K",
          email: profileData.email || "chandruk@example.com",
          phone: profileData.phone || "+91-9876543210",
          location: profileData.location || "Tamil Nadu, India",
          summary: profileData.summary || "Full Stack Developer with expertise in React, Node.js, AI/ML, and Cloud technologies.",
          skills: organizedSkills.length > 0 ? organizedSkills : [
            { category: "Frontend", items: ["React", "JavaScript", "Tailwind CSS", "HTML5", "CSS3"] },
            { category: "Backend", items: ["Node.js", "Express", "MongoDB", "PostgreSQL"] },
            { category: "Tools", items: ["Git", "Docker", "VS Code"] }
          ],
          experience: formattedExperience.length > 0 ? formattedExperience : [
            {
              title: "Full Stack Developer",
              company: "Self Projects & Freelance",
              duration: "2023 - Present",
              description: "Developed full-stack applications with React and Node.js"
            }
          ],
          education: formattedEducation.length > 0 ? formattedEducation : [
            {
              degree: "Bachelor of Technology (B.Tech)",
              field: "AI & Data Science",
              institution: "Kathir College of Engineering",
              year: "2022 - Present",
              cgpa: "8.3"
            }
          ],
          projects: formattedProjects.length > 0 ? formattedProjects : [
            {
              name: "AI-Powered Portfolio Website",
              description: "Personal portfolio with integrated AI assistant",
              tech: "React, Node.js, Express"
            }
          ]
        });
        
        console.log('Final Profile:', {
          skillsCount: organizedSkills.length,
          experienceCount: formattedExperience.length,
          educationCount: formattedEducation.length,
          projectsCount: formattedProjects.length
        });
      } catch (err) {
        console.error('Failed to fetch resume data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchResumeData();
    }
  }, [isOpen]);

  const downloadPDF = async () => {
    try {
      // Dynamically import libraries
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      const element = document.getElementById("resume-modal-content");
      if (!element) {
        alert('Resume content not found. Please try again.');
        return;
      }

      // Create a temporary wrapper with proper layout
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = '210mm'; // A4 width
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.padding = '20mm';
      wrapper.style.boxSizing = 'border-box';
      
      // Clone content
      const clone = element.cloneNode(true);
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.width = '100%';
      wrapper.appendChild(clone);
      
      // Add comprehensive styling for PDF with complete color overrides
      const style = document.createElement('style');
      style.textContent = `
        @media all {
          * {
            color: rgb(51, 51, 51) !important;
            box-sizing: border-box !important;
            background-image: none !important;
          }
          h1 { font-size: 28px !important; color: rgb(17, 24, 39) !important; }
          h2 { font-size: 20px !important; color: rgb(17, 24, 39) !important; }
          h3 { font-size: 18px !important; color: rgb(17, 24, 39) !important; }
          h4 { font-size: 16px !important; color: rgb(17, 24, 39) !important; }
          p, span, div { font-size: 14px !important; }
          h1, h2, h3, h4, h5, h6 {
            margin-bottom: 8px !important;
          }
          .text-blue-600, [class*="text-blue-6"], .text-blue-500 {
            color: rgb(37, 99, 235) !important;
          }
          .text-gray-700, [class*="text-gray-7"] {
            color: rgb(55, 65, 81) !important;
          }
          .text-gray-900, [class*="text-gray-9"] {
            color: rgb(17, 24, 39) !important;
          }
          .text-gray-500, .text-gray-600 {
            color: rgb(107, 114, 128) !important;
          }
          .bg-blue-50, [class*="bg-blue-5"] {
            background-color: rgb(239, 246, 255) !important;
            background-image: none !important;
          }
          .bg-white {
            background-color: rgb(255, 255, 255) !important;
            background-image: none !important;
          }
          .bg-gray-50 {
            background-color: rgb(249, 250, 251) !important;
            background-image: none !important;
          }
          .border-blue-300 {
            border-color: rgb(147, 197, 253) !important;
          }
          .border-blue-600 {
            border-color: rgb(37, 99, 235) !important;
          }
          .border-blue-200, .border-b-2 {
            border-color: rgb(191, 219, 254) !important;
          }
          .border-l-4 {
            border-left-color: rgb(37, 99, 235) !important;
          }
          [class*="bg-gradient"], [class*="from-"], [class*="to-"], [class*="via-"] {
            background: transparent !important;
            background-image: none !important;
          }
          [class*="bg-gradient"] span, [class*="bg-gradient"] * {
            background: transparent !important;
            background-image: none !important;
          }
          .max-h-\\[80vh\\], .overflow-y-auto {
            max-height: none !important;
            overflow: visible !important;
          }
          #resume-modal-content {
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .grid {
            display: block !important;
          }
          .grid > * {
            margin-bottom: 12px !important;
          }
          .mb-8 {
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
          }
          .space-y-6 > *, .space-y-4 > * {
            margin-bottom: 12px !important;
            page-break-inside: avoid !important;
          }
          .bg-blue-50, .rounded-lg {
            page-break-inside: avoid !important;
          }
          svg {
            color: rgb(37, 99, 235) !important;
          }
        }
      `;
      wrapper.appendChild(style);
      document.body.appendChild(wrapper);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: wrapper.offsetWidth,
        windowHeight: wrapper.offsetHeight,
        foreignObjectRendering: false
      });

      // Remove wrapper
      document.body.removeChild(wrapper);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let yPosition = 0;
      let pageNumber = 0;

      // Add pages - only add what's needed
      while (yPosition < imgHeight) {
        if (pageNumber > 0) {
          pdf.addPage();
        }
        
        // Calculate which part of the image to use
        const sourceY = (yPosition / imgHeight) * canvas.height;
        const remainingHeight = canvas.height - sourceY;
        const sourceHeight = Math.min(
          (pageHeight / imgHeight) * canvas.height,
          remainingHeight
        );
        
        // Skip if there's very little content left (less than 5% of page)
        if (remainingHeight < (canvas.height * 0.05)) {
          break;
        }
        
        // Create page canvas
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        const ctx = pageCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
        const actualHeight = (sourceHeight * imgWidth) / canvas.width;
        
        pdf.addImage(pageImg, 'JPEG', 0, 0, imgWidth, actualHeight, '', 'FAST');
        
        yPosition += pageHeight;
        pageNumber++;
        
        // Prevent infinite loop - max 5 pages
        if (pageNumber >= 5) {
          break;
        }
      }

      // Download
      pdf.save(`${profile.name.replace(/\s+/g, '_')}_Resume.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message}. Please try again.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" 
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Resume</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          id="resume-modal-content"
          className="p-8 md:p-12 overflow-y-auto max-h-[80vh]"
        >
          {/* Header Section */}
          <div className="text-center mb-6 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-1 uppercase tracking-wide">{profile.name}</h1>
            <p className="text-sm text-gray-600 mb-2">{profile.summary.split('.')[0]}</p>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-700">
              <span>{profile.location}</span>
              <span>|</span>
              <span>{profile.phone}</span>
              <span>|</span>
              <span>{profile.email}</span>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 uppercase border-b-2 border-gray-900 pb-1">
              PROFESSIONAL SUMMARY
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
          </div>

          {/* Technical Skills */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 uppercase border-b-2 border-gray-900 pb-1">
              TECHNICAL SKILLS
            </h3>
            <div className="space-y-2">
              {profile.skills.map((skillGroup, idx) => (
                <div key={idx} className="flex">
                  <span className="font-bold text-sm text-gray-900 min-w-[120px]">{skillGroup.category}:</span>
                  <span className="text-sm text-gray-700">{skillGroup.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 uppercase border-b-2 border-gray-900 pb-1">
              EXPERIENCE
            </h3>
            <div className="space-y-4">
              {profile.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{exp.title}, {exp.company}</h4>
                    <span className="text-xs text-gray-600 italic">{exp.duration}</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-3">• {exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 uppercase border-b-2 border-gray-900 pb-1">
              PROJECTS
            </h3>
            <div className="space-y-3">
              {profile.projects.map((proj, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{proj.name}</h4>
                  <p className="text-sm text-gray-700 ml-3 mb-1">• {proj.description}</p>
                  {proj.tech && (
                    <p className="text-xs text-gray-600 ml-3">
                      <span className="font-semibold">Tech:</span> {proj.tech}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 uppercase border-b-2 border-gray-900 pb-1">
              EDUCATION
            </h3>
            <div className="space-y-3">
              {profile.education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-gray-900">
                      {edu.degree} - {edu.field}, {edu.institution}
                      {edu.cgpa && <span className="text-gray-700 font-normal"> | CGPA: {edu.cgpa}/10</span>}
                    </h4>
                    <span className="text-xs text-gray-600 italic">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <FaDownload />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
