import { useState, useEffect } from 'react';
import api from '../lib/api';

export const useDashboardStats = () => {
    const [stats, setStats] = useState({
        totalCompanies: 0,
        totalProducts: 0,
        totalEmployees: 0,
        activeEvents: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/dashboard/stats');
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, error, refreshStats: fetchStats };
};
