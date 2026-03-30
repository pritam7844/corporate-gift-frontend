import { useState, useEffect, useCallback } from 'react';
import { getArrivalsAPI, createArrivalAPI, updateArrivalAPI, deleteArrivalAPI } from '../services/new-arrival.service';

export const useNewArrivals = () => {
    const [arrivals, setArrivals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchArrivals = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getArrivalsAPI();
            setArrivals(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load new arrivals.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addArrival = async (arrivalData) => {
        setLoading(true);
        setError('');
        try {
            const newArrival = await createArrivalAPI(arrivalData);
            setArrivals((prev) => [newArrival, ...prev]);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create new arrival.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateArrival = async (id, arrivalData) => {
        setLoading(true);
        setError('');
        try {
            const updated = await updateArrivalAPI(id, arrivalData);
            setArrivals((prev) => prev.map(a => a._id === id ? updated : a));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update new arrival.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeArrival = async (id) => {
        try {
            await deleteArrivalAPI(id);
            setArrivals((prev) => prev.filter(a => a._id !== id));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete new arrival.');
            return false;
        }
    };

    useEffect(() => {
        fetchArrivals();
    }, [fetchArrivals]);

    return { arrivals, loading, error, addArrival, updateArrival, removeArrival, fetchArrivals };
};
