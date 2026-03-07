import { useState, useEffect, useCallback } from 'react';
import { getUsersAPI, createCompanyUserAPI, deleteUserAPI } from '../services/user.service';

export const useUsers = (companyId = null) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getUsersAPI(companyId);
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    const addUser = async (userData) => {
        try {
            const newUser = await createCompanyUserAPI({ ...userData, companyId });
            setUsers((prev) => [newUser, ...prev]);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user.');
            return false;
        }
    };

    const removeUser = async (id) => {
        try {
            await deleteUserAPI(id);
            setUsers((prev) => prev.filter(u => u._id !== id));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user.');
            return false;
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, addUser, removeUser, fetchUsers };
};
