import { useState, useEffect, useCallback } from 'react';
import { getCompaniesAPI, createCompanyAPI } from '../services/company.service';

export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch companies from the backend
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCompaniesAPI();
      setCompanies(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load companies.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new company
  const addCompany = async (companyData) => {
    setLoading(true);
    setError('');
    try {
      const newCompany = await createCompanyAPI(companyData);
      // Update the UI state immediately with the new company
      setCompanies((prev) => [newCompany, ...prev]); 
      return true; // Indicates success so the UI can close the form
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company.');
      return false; 
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch when the hook is first used
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, loading, error, addCompany, fetchCompanies };
};