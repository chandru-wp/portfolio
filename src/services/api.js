// Use Render backend for both development and production
const API_URL = 'https://portfolio-backend-ykvn.onrender.com';

// Portfolio API
export const portfolioAPI = {
  // Get all portfolios
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/portfolio`);
    if (!response.ok) throw new Error('Failed to fetch portfolios');
    return response.json();
  },

  // Get portfolio by ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/portfolio/${id}`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
  },

  // Create new portfolio
  create: async (data) => {
    const response = await fetch(`${API_URL}/api/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create portfolio');
    return response.json();
  },

  // Update portfolio
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/api/portfolio/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update portfolio');
    return response.json();
  },

  // Delete portfolio
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/portfolio/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete portfolio');
    return response.json();
  }
};

// Profile API
export const profileAPI = {
  get: async () => {
    const response = await fetch(`${API_URL}/api/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },
  update: async (data) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
};

// Skills API
export const skillsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/skills`);
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/api/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create skill');
    return response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/api/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update skill');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/skills/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete skill');
    return response.json();
  }
};

// Experience API
export const experienceAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/experience`);
    if (!response.ok) throw new Error('Failed to fetch experience');
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/api/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create experience');
    return response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/api/experience/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update experience');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/experience/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete experience');
    return response.json();
  }
};

// Education API
export const educationAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/education`);
    if (!response.ok) throw new Error('Failed to fetch education');
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/api/education`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create education');
    return response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/api/education/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update education');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/education/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete education');
    return response.json();
  }
};

// Messages API
export const messagesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },
  reply: async (id, data) => {
    const response = await fetch(`${API_URL}/api/messages/${id}/reply`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to reply to message');
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create message');
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/messages/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete message');
    return response.json();
  }
};

// Auth API
export const authAPI = {
  // Register new user
  register: async (username, password, role = 'user') => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }
      throw error;
    }
  },

  // Login user
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }
      throw error;
    }
  },

  // Change user role (admin only)
  changeRole: async (userId, role) => {
    const response = await fetch(`${API_URL}/api/change-role/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!response.ok) throw new Error('Failed to change role');
    return response.json();
  }
};
// AI Assistant API
export const aiAPI = {
  // Query AI for answers
  query: async (question, context = {}) => {
    try {
      const response = await fetch(`${API_URL}/api/ai-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context })
      });
      
      if (!response.ok) throw new Error('Failed to get AI response');
      return response.json();
    } catch (error) {
      console.error('AI Query error:', error);
      throw error;
    }
  }
};