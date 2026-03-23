const getApiUrl = () => {
  // For development, use local backend
  if (process.env.NODE_ENV === 'development') {
    return "http://localhost:5004";
  }
  // For production, use the deployed backend URL
  return "https://food-recipes-3.onrender.com";
};

export const API_BASE_URL = getApiUrl();

export const buildUrl = (path = "") => {
  if (!path) {
    return API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
