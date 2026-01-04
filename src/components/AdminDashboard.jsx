import { useState, useEffect } from 'react';
import { portfolioAPI, profileAPI, skillsAPI, experienceAPI, educationAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ReplyControls({ msg, onUpdate }) {
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState(msg?.reply || '');

  const handleSend = async () => {
    try {
      await messagesAPI.reply(msg.id, { reply: replyText, replied: true });
      setReplyMode(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return;
    try {
      await messagesAPI.delete(msg.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  return (
    <div className="flex flex-col items-stretch">
      {!replyMode ? (
        <>
          <button onClick={() => setReplyMode(true)} className="px-3 py-1 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700">Reply</button>
          <button onClick={handleDelete} className="px-3 py-1 bg-red-100/70 text-red-600 rounded font-semibold hover:bg-red-200">Delete</button>
        </>
      ) : (
        <div className="w-64">
          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-2 border rounded mb-2" rows={4} />
          <div className="flex gap-2">
            <button onClick={handleSend} className="px-3 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded font-semibold">Send</button>
            <button onClick={() => setReplyMode(false)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [profile, setProfile] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github: '',
    website: ''
  });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    about: ''
  });
  
  // Skills form state
  const [skillsForm, setSkillsForm] = useState({ category: '', items: '' });
  const [editingSkill, setEditingSkill] = useState(null);
  
  // Experience form state
  const [expForm, setExpForm] = useState({ role: '', company: '', description: '' });
  const [editingExp, setEditingExp] = useState(null);
  
  // Education form state
  const [eduForm, setEduForm] = useState({ degree: '', institution: '', year: '' });
  const [editingEdu, setEditingEdu] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  // Update profile form when profile data loads
  useEffect(() => {
    if (Object.keys(profile).length > 0) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        about: profile.about || ''
      });
    }
  }, [profile]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setMessage(''); // Clear previous messages
      
      console.log('Loading data from API...');
      
      const [proj, skill, exp, edu, prof] = await Promise.all([
        portfolioAPI.getAll().catch(err => {
          console.error('Portfolio error:', err);
          setMessage('Portfolio load failed: ' + err.message);
          return [];
        }),
        skillsAPI.getAll().catch(err => {
          console.error('Skills error:', err);
          return [];
        }),
        experienceAPI.getAll().catch(err => {
          console.error('Experience error:', err);
          return [];
        }),
        educationAPI.getAll().catch(err => {
          console.error('Education error:', err);
          return [];
        }),
        profileAPI.get().catch(err => {
          console.error('Profile error:', err);
          return {};
        })
      ]);
      
      console.log('Data loaded:', { proj, skill, exp, edu, prof });
      
      setProjects(proj || []);
      setSkills(skill || []);
      setExperience(exp || []);
      setEducation(edu || []);
      setProfile(prof || {});
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await portfolioAPI.update(editing, formData);
        setMessage('Project updated successfully!');
      } else {
        // For create, we need userId - using a dummy value for now
        // In production, this should come from the logged-in user
        await portfolioAPI.create({
          ...formData,
          userId: '507f1f77bcf86cd799439011' // Placeholder - should be actual user ID
        });
        setMessage('Project created successfully!');
      }
      setFormData({ title: '', description: '', github: '', website: '' });
      setEditing(null);
      loadAllData();
    } catch (error) {
      setMessage('Error saving project');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (project) => {
    setEditing(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      github: project.github || '',
      website: project.website || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await portfolioAPI.delete(id);
      setMessage('Project deleted successfully!');
      loadAllData();
    } catch (error) {
      setMessage('Error deleting project');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({ title: '', description: '', github: '', website: '' });
  };

  // Skills handlers
  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const itemsArray = skillsForm.items.split(',').map(item => item.trim()).filter(item => item);
      await skillsAPI.create({
        category: skillsForm.category,
        items: itemsArray
      });
      setMessage('Skill added successfully!');
      setSkillsForm({ category: '', items: '' });
      loadAllData();
    } catch (error) {
      setMessage('Error adding skill');
    }
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill.id);
    setSkillsForm({
      category: skill.category,
      items: skill.items?.join(', ') || ''
    });
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    try {
      const itemsArray = skillsForm.items.split(',').map(item => item.trim()).filter(item => item);
      await skillsAPI.update(editingSkill, {
        category: skillsForm.category,
        items: itemsArray
      });
      setMessage('Skill updated successfully!');
      setSkillsForm({ category: '', items: '' });
      setEditingSkill(null);
      loadAllData();
    } catch (error) {
      setMessage('Error updating skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await skillsAPI.delete(id);
      setMessage('Skill deleted successfully!');
      loadAllData();
    } catch (error) {
      setMessage('Error deleting skill');
    }
  };

  // Experience handlers
  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      await experienceAPI.create(expForm);
      setMessage('Experience added successfully!');
      setExpForm({ role: '', company: '', description: '' });
      loadAllData();
    } catch (error) {
      setMessage('Error adding experience');
    }
  };

  const handleEditExperience = (exp) => {
    setEditingExp(exp.id);
    setExpForm({
      role: exp.role,
      company: exp.company,
      description: exp.description
    });
  };

  const handleUpdateExperience = async (e) => {
    e.preventDefault();
    try {
      await experienceAPI.update(editingExp, expForm);
      setMessage('Experience updated successfully!');
      setExpForm({ role: '', company: '', description: '' });
      setEditingExp(null);
      loadAllData();
    } catch (error) {
      setMessage('Error updating experience');
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!confirm('Delete this experience?')) return;
    try {
      await experienceAPI.delete(id);
      setMessage('Experience deleted successfully!');
      loadAllData();
    } catch (error) {
      setMessage('Error deleting experience');
    }
  };

  // Education handlers
  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      await educationAPI.create(eduForm);
      setMessage('Education added successfully!');
      setEduForm({ degree: '', institution: '', year: '' });
      loadAllData();
    } catch (error) {
      setMessage('Error adding education');
    }
  };

  const handleEditEducation = (edu) => {
    setEditingEdu(edu.id);
    setEduForm({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year
    });
  };

  const handleUpdateEducation = async (e) => {
    e.preventDefault();
    try {
      await educationAPI.update(editingEdu, eduForm);
      setMessage('Education updated successfully!');
      setEduForm({ degree: '', institution: '', year: '' });
      setEditingEdu(null);
      loadAllData();
    } catch (error) {
      setMessage('Error updating education');
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!confirm('Delete this education?')) return;
    try {
      await educationAPI.delete(id);
      setMessage('Education deleted successfully!');
      loadAllData();
    } catch (error) {
      setMessage('Error deleting education');
    }
  };

  // Profile handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.update(profileForm);
      setMessage('Profile updated successfully!');
      loadAllData();
    } catch (error) {
      setMessage('Error saving profile');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe]">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-white/50">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eef3ff] via-[#e8edff] to-[#dbeafe]">
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[550px] h-[550px] bg-blue-400/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-purple-400/20 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative w-full py-8 px-6 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">Manage Your Portfolio Content</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors rounded-lg bg-white/60 backdrop-blur hover:bg-white/80 font-semibold"
              aria-label="Go to home page"
            >
               Home
            </button>
            <button
              onClick={() => { 
                logout(); 
                window.location.href = '/'; 
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-100/70 backdrop-blur border-2 border-blue-400 text-blue-700 rounded-xl text-sm font-semibold">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-10 flex gap-3 overflow-x-auto pb-4 border-b-2 border-white/40">
          {['projects', 'skills', 'experience', 'education', 'profile', 'users', 'messages'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-t-2xl font-bold text-lg transition-all whitespace-nowrap relative ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/40 backdrop-blur text-gray-700 hover:bg-white/60 border-b-2 border-transparent hover:border-blue-400/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-8 bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl hover:shadow-3xl transition-all">
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editing ? 'Edit Project' : 'Add New Project'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition font-medium text-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition font-medium text-lg"
                  required
                />
                <input
                  type="url"
                  placeholder="GitHub URL"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition font-medium text-lg"
                />
                <input
                  type="url"
                  placeholder="Website URL"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition font-medium text-lg"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all active:scale-95"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-300/70 backdrop-blur text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Projects List */}
            <div>
              <h3 className="text-3xl font-bold mb-6 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">All Projects</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 border-2 border-white/40 rounded-lg bg-white/50 backdrop-blur hover:shadow-lg hover:bg-white/60 transition-all"
                    >
                      <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg text-gray-900 whitespace-normal break-words">{project.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            {project.github && (
                              <a href={project.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                                GitHub
                              </a>
                            )}
                            {project.website && (
                              <a href={project.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                                Website
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(project)}
                            className="px-3 py-1 bg-blue-100/70 backdrop-blur text-blue-600 rounded font-semibold hover:bg-blue-200 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="px-3 py-1 bg-red-100/70 backdrop-blur text-red-600 rounded font-semibold hover:bg-red-200 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No projects added yet. Create one using the form above!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl p-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Users & Admins</h3>
            <div className="space-y-4">
              {users.length > 0 ? (
                users.map((u) => (
                  <div key={u.id} className="p-4 bg-white/80 rounded-xl border border-white/50 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">{u.username?.charAt(0)?.toUpperCase() || 'U'}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{u.username}</h4>
                        <p className="text-sm text-gray-500">{u.email || 'No email'}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role === 'admin' ? '👤 Admin' : '👥 User'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No users found</p>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {/* Messages functionality disabled - will be enabled after database setup */}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl p-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Manage Skills</h3>
            
            {/* Skills Form */}
            <form onSubmit={editingSkill ? handleUpdateSkill : handleAddSkill} className="mb-8 p-6 bg-white/50 rounded-2xl border border-white/60">
              <h4 className="text-xl font-bold mb-4 text-gray-900">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Category (e.g., Frontend)"
                  value={skillsForm.category}
                  onChange={(e) => setSkillsForm({ ...skillsForm, category: e.target.value })}
                  className="px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Items (comma separated)"
                  value={skillsForm.items}
                  onChange={(e) => setSkillsForm({ ...skillsForm, items: e.target.value })}
                  className="px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  {editingSkill ? 'Update' : 'Add'}
                </button>
                {editingSkill && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSkill(null);
                      setSkillsForm({ category: '', items: '' });
                    }}
                    className="px-6 py-2 bg-gray-300/70 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Skills List */}
            <div className="space-y-4">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <div key={skill.id} className="p-4 bg-white/70 backdrop-blur rounded-xl border border-white/50 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 whitespace-normal break-words">{skill.category}</h4>
                        <p className="text-gray-700 mt-2">{skill.items?.join(', ')}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => handleEditSkill(skill)}
                          className="px-4 py-2 bg-blue-100/70 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="px-4 py-2 bg-red-100/70 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No skills added yet</p>
              )}
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl p-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Manage Experience</h3>
            
            {/* Experience Form */}
            <form onSubmit={editingExp ? handleUpdateExperience : handleAddExperience} className="mb-8 p-6 bg-white/50 rounded-2xl border border-white/60">
              <h4 className="text-xl font-bold mb-4 text-gray-900">{editingExp ? 'Edit Experience' : 'Add New Experience'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Job Role"
                  value={expForm.role}
                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  className="px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  className="px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <textarea
                placeholder="Description"
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500 mb-4 resize-none"
                rows="3"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  {editingExp ? 'Update' : 'Add'}
                </button>
                {editingExp && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExp(null);
                      setExpForm({ role: '', company: '', description: '' });
                    }}
                    className="px-6 py-2 bg-gray-300/70 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Experience List */}
            <div className="space-y-4">
              {experience.length > 0 ? (
                experience.map((exp) => (
                  <div key={exp.id} className="p-4 bg-white/70 backdrop-blur rounded-xl border border-white/50 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 whitespace-normal break-words">{exp.role}</h4>
                        <p className="text-indigo-600 font-semibold">{exp.company}</p>
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => handleEditExperience(exp)}
                          className="px-4 py-2 bg-blue-100/70 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="px-4 py-2 bg-red-100/70 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No experience added yet</p>
              )}
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl p-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Manage Education</h3>
            
            {/* Education Form */}
            <form onSubmit={editingEdu ? handleUpdateEducation : handleAddEducation} className="mb-8 p-6 bg-white/50 rounded-2xl border border-white/60">
              <h4 className="text-xl font-bold mb-4 text-gray-900">{editingEdu ? 'Edit Education' : 'Add New Education'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Degree"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Year/Period"
                value={eduForm.year}
                onChange={(e) => setEduForm({ ...eduForm, year: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg bg-white/80 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500 mb-4"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  {editingEdu ? 'Update' : 'Add'}
                </button>
                {editingEdu && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEdu(null);
                      setEduForm({ degree: '', institution: '', year: '' });
                    }}
                    className="px-6 py-2 bg-gray-300/70 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Education List */}
            <div className="space-y-4">
              {education.length > 0 ? (
                education.map((edu) => (
                  <div key={edu.id} className="p-4 bg-white/70 backdrop-blur rounded-xl border border-white/50 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 whitespace-normal break-words">{edu.degree}</h4>
                        <p className="text-indigo-600 font-semibold">{edu.institution}</p>
                        <p className="text-gray-700 mt-2">{edu.year}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => handleEditEducation(edu)}
                          className="px-4 py-2 bg-blue-100/70 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="px-4 py-2 bg-red-100/70 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No education added yet</p>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-white/60 shadow-2xl p-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Profile & Image</h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Image Upload */}
              <div className="p-8 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl border-3 border-dashed border-blue-400 hover:border-blue-500 transition-all">
                <label className="flex flex-col items-center justify-center cursor-pointer gap-3">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-2xl mb-2">Upload Profile Image</p>
                    <p className="text-base text-gray-700">Click to select or drag and drop</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="p-4 bg-white/70 backdrop-blur rounded-xl border border-white/50">
                  <p className="font-semibold text-gray-900 mb-3">Preview:</p>
                  <img src={imagePreview} alt="Preview" className="max-w-xs h-auto rounded-lg shadow-lg" />
                </div>
              )}

              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition font-medium"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition font-medium"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition font-medium"
                />
              </div>

              <textarea
                placeholder="About You"
                value={profileForm.about}
                onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                rows="5"
                className="w-full px-5 py-4 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition resize-none font-medium"
              />

              <button 
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all active:scale-95"
              >
                Save Profile
              </button>
            </form>
          </div>
        )}
        
        {/* Sign out */}
        <div className="mt-6 text-center flex gap-4 justify-center">
          <button 
            onClick={() => { window.location.href = '/'; }} 
            className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 border border-blue-200 transition-all"
          >
            Go to Home
          </button>
          <button 
            onClick={() => { 
              logout(); 
              window.location.href = '/'; 
            }} 
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
