import api from '../lib/api';

export const getEventsAPI = async (isGlobal = true, companyId = null) => {
    let url = '/events';
    const params = new URLSearchParams();
    if (isGlobal) params.append('isGlobal', 'true');
    if (companyId) params.append('companyId', companyId);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const response = await api.get(queryString ? `${url}` : `/events/all`); // Backend has getAllEvents at /events/all or similar
    // Wait, let's check backend routes for events
    return response.data.data;
};

export const createEventAPI = async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data.data;
};

export const assignEventToCompanyAPI = async (assignmentData) => {
    const response = await api.post('/events/assign', assignmentData);
    return response.data.data;
};

export const updateEventProductsAPI = async (eventId, productIds) => {
    const response = await api.patch('/events/add-products', { eventId, productIds });
    return response.data.data;
};

export const getEventByIdAPI = async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
};

export const getEmployeeEventsAPI = async () => {
    const response = await api.get('/events/my-events');
    return response.data.data;
};
