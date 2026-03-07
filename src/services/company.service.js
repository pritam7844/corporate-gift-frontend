import api from '../lib/api';

export const getCompaniesAPI = async () => {
  const response = await api.get('/companies');
  return response.data.data;
};

export const createCompanyAPI = async (data) => {
  const response = await api.post('/companies', data);
  return response.data.data;
};

export const getCompanyByIdAPI = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data.data;
};

export const updateCompanyAPI = async (id, data) => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data.data;
};

export const deleteCompanyAPI = async (id) => {
  const response = await api.delete(`/companies/${id}`);
  return response.data.data;
};