import { useState, useEffect, useCallback } from 'react';
import { getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI } from '../services/product.service';

export const useProducts = (isGlobal = true, companyId = null) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getProductsAPI(isGlobal, companyId);
            setProducts(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load products.');
        } finally {
            setLoading(false);
        }
    }, [isGlobal, companyId]);

    const addProduct = async (productData) => {
        setLoading(true);
        setError('');
        try {
            const newProduct = await createProductAPI(productData);
            setProducts((prev) => [newProduct, ...prev]);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeProduct = async (id) => {
        try {
            await deleteProductAPI(id);
            setProducts((prev) => prev.filter(p => p._id !== id));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product.');
            return false;
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const updated = await updateProductAPI(id, productData);
            setProducts((prev) => prev.map(p => p._id === id ? updated : p));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product.');
            return false;
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, error, addProduct, updateProduct, removeProduct, fetchProducts };
};
