import { useState, useEffect, useCallback } from 'react';
import { Doctor } from '../types';
import { getCurrentDoctor } from '../services/doctorService';

export function useCurrentDoctor() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doc = await getCurrentDoctor();
      setDoctor(doc);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener('caseflow_doctor_updated', handleUpdate);
    return () => {
      window.removeEventListener('caseflow_doctor_updated', handleUpdate);
    };
  }, [refresh]);

  return { doctor, loading, error, refresh, setDoctor };
}
