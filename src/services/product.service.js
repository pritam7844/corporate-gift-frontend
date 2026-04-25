import api from '../lib/api';

export const getProductsAPI = async (isGlobal = true, companyId = null) => {
    let url = '/products';
    const params = new URLSearchParams();
    if (isGlobal) params.append('global', 'true');
    if (companyId) params.append('companyId', companyId);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const response = await api.get(url);
    return response.data.data;
};

export const createProductAPI = async (productData) => {
    const response = await api.post('/products', productData);
    return response.data.data;
};

export const updateProductAPI = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
};

export const deleteProductAPI = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data.data;
};
export const getProductByIdAPI = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
};
