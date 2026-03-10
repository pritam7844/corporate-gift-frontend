import { useState, useEffect, useCallback } from 'react';
import { getEventsAPI, createEventAPI, assignEventToCompanyAPI, getEmployeeEventsAPI, deleteEventAPI, updateEventAPI } from '../services/event.service';

export const useEvents = (isGlobal = true, companyId = null, fetchForEmployee = false) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            let data;
            if (fetchForEmployee) {
                data = await getEmployeeEventsAPI();
            } else {
                data = await getEventsAPI(isGlobal, companyId);
            }
            setEvents(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load events.');
        } finally {
            setLoading(false);
        }
    }, [isGlobal, companyId, fetchForEmployee]);

    const addEvent = async (eventData) => {
        setLoading(true);
        setError('');
        try {
            const newEvent = await createEventAPI(eventData);
            setEvents((prev) => [newEvent, ...prev]);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeEvent = async (id) => {
        try {
            await deleteEventAPI(id);
            setEvents((prev) => prev.filter(e => e._id !== id));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete event.');
            return false;
        }
    };

    const updateEvent = async (id, eventData) => {
        try {
            const updated = await updateEventAPI(id, eventData);
            setEvents((prev) => prev.map(e => e._id === id ? updated : e));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event.');
            return false;
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, loading, error, addEvent, removeEvent, updateEvent, fetchEvents };
};
