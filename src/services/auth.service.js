import api from '../lib/api';

export const loginAdminAPI = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const loginEmployeeAPI = async (email, password, subdomain) => {
  const response = await api.post('/auth/login', { email, password, subdomain });
  return response.data.data;
};