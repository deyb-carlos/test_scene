import axios from 'axios';



const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api", 
  timeout: 100000,
});

// Add request interceptor to inject token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const refreshToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await axios.post(
      import.meta.env.VITE_API_BASE_URL + "/api/refresh-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Save new token
    const newToken = response.data.access_token;
    localStorage.setItem("token", newToken);
    return newToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    // If refresh fails, force logout
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token (401) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh the token
      const newToken = await refreshToken();
      if (newToken) {
        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      }
    }
    
    // If we couldn't refresh the token or it wasn't a 401, pass along the error
    return Promise.reject(error);
  }
);

// Storyboard endpoints
export const storyboardAPI = {
  create: (name) => API.post('/home', { name }),
  rename: (id, name) => API.patch(`/storyboard/${id}`, { name:name }),
  delete: (id) => API.delete(`/storyboard/${id}`),
  getAll: () => API.get('/home'),
};

// Auth endpoints (based on your main.py)
export const authAPI = {
  login: (credentials) => API.post('/token', credentials),
  register: (userData) => API.post('/register', userData),
  verify: () => API.get('/verify-token'),
  get_current_user: () => API.get('/me'), 
};

export const imagesAPI = {
  generateImages: (id, formData) => API.post(`/generate-images/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }), 


  getImages: (storyboardId) => API.get(`/storyboard/images/${storyboardId}`),
  deleteImage: (imageId) => API.delete(`/images/${imageId}`),
  updateImageCaption: (imageId, caption) => {
    const formData = new FormData();
    formData.append('caption', caption);
    
    return API.patch(`/images/${imageId}/caption`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
regenerateImage: (imageId, caption, seed = null, resolution = "1:1", isOpenPose = false, pose_img = null) => {
  const formData = new FormData();
  formData.append('caption', caption);
  formData.append('resolution', resolution); 
  formData.append('isOpenPose', isOpenPose.toString());

  console.log("Resolution api.js:", resolution);
    console.log("open api.js:", isOpenPose);
    console.log("pose_img api.js:", pose_img);

  if (seed !== null && seed !== undefined && seed !== '') {
    formData.append('seed', seed.toString());
  }

  if (isOpenPose && pose_img) {
    formData.append('pose_img', pose_img);
  }

  return API.post(`/regenerate-image/${imageId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
},
};

export const tokenService = {
  refreshToken,
};