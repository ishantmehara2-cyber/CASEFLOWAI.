import { useState, useEffect, useCallback } from 'react';
import { Doctor } from '../types';
import { getCurrentDoctor, updateDoctorProfile, uploadDoctorProfilePhoto } from '../services/doctorService';

export function useCurrentDoctor() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doc = await getCurrentDoctor();
      setDoctor(doc);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch doctor profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  const updateProfile = async (updatedData: Partial<Doctor>) => {
    setLoading(true);
    try {
      const updated = await updateDoctorProfile(updatedData);
      setDoctor(updated);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setLoading(true);
    try {
      const updated = await uploadDoctorProfilePhoto(file);
      setDoctor(updated);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    doctor,
    loading,
    error,
    refresh: fetchDoctor,
    updateProfile,
    uploadPhoto,
  };
}
