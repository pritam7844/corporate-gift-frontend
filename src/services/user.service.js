import api from '../lib/api';

export const getUsersAPI = async (companyId = null) => {
    const url = companyId ? `/users?companyId=${companyId}` : '/users';
    const response = await api.get(url);
    return response.data.data;
};

export const createCompanyUserAPI = async (userData) => {
    const response = await api.post('/users/company-user', userData);
    return response.data.data;
};

export const updateUserAPI = async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
};

export const deleteUserAPI = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data.data;
};
