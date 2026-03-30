import api from '../lib/api';

export const getArrivalsAPI = async () => {
    const response = await api.get('/new-arrivals');
    return response.data.data;
};

export const createArrivalAPI = async (arrivalData) => {
    const response = await api.post('/new-arrivals', arrivalData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const updateArrivalAPI = async (id, arrivalData) => {
    const response = await api.put(`/new-arrivals/${id}`, arrivalData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const deleteArrivalAPI = async (id) => {
    const response = await api.delete(`/new-arrivals/${id}`);
    return response.data;
};
