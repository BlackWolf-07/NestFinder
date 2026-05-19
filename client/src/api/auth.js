import API from './index';

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const sendOtp = async (phone) => {
  const response = await API.post('/auth/send-otp', { phone });
  return response.data;
};

export const verifyOtp = async (phone, otp) => {
  const response = await API.post('/auth/verify-otp', { phone, otp });
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};
