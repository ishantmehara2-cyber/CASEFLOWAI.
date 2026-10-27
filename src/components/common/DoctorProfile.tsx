import React, { useState, useEffect, useCallback } from 'react';
import { Doctor } from '../../types';
import { getCurrentDoctor } from '../../services/doctorService';
import { ChevronDown, User, LogOut, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DoctorProfileProps {
  doctor?: Doctor;
  className?: string;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor: propDoctor, className }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(propDoctor || null);
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const fetchDoctor = useCallback(async () => {
    try {
      const doc = await getCurrentDoctor();
      setDoctor(doc);
      setImgError(false);
    } catch (e) {
      console.error('Failed to load doctor profile in header:', e);
    }
  }, []);

  useEffect(() => {
    if (!propDoctor) {
      fetchDoctor();
    } else {
      setDoctor(propDoctor);
      setImgError(false);
    }

    const handleUpdate = () => {
      fetchDoctor();
    };

    window.addEventListener('caseflow_doctor_updated', handleUpdate);
    return () => {
      window.removeEventListener('caseflow_doctor_updated', handleUpdate);
    };
  }, [propDoctor, fetchDoctor]);

  const handleLogout = () => {
    setIsOpen(false);
    navigate('/login');
  };

  const doctorName = doctor ? doctor.name : 'Dr. Doctor';
  const specialization = doctor ? doctor.specialization : 'Medical Practitioner';
  const profilePhoto = doctor?.profilePhoto;

  const getInitials = () => {
    if (doctor?.firstName && doctor?.lastName) {
      return `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
    }
    if (doctorName) {
      const clean = doctorName.replace(/^Dr\.\s*/i, '').trim();
      const parts = clean.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
    }
    return 'DR';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
      >
        {/* Profile photo or clean Initials fallback */}
        {profilePhoto && !imgError ? (
          <img
            src={profilePhoto}
            alt={doctorName}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-subtle tracking-wider">
            {getInitials()}
          </div>
        )}

        {/* Doctor Name & Specialization */}
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-navy-900 leading-tight">{doctorName}</p>
          <p className="text-[11px] text-navy-500 leading-tight">{specialization}</p>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-navy-400 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-slate-200 py-1.5 z-20 animate-fade-in">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-navy-900">{doctorName}</p>
              <p className="text-[11px] text-navy-500">{doctor?.email || 'doctor@caseflowai.med'}</p>
              <div className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-medium border border-brand-100">
                <Shield className="w-3 h-3 mr-1" /> Verified Clinical Account
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center px-4 py-2 text-xs text-navy-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4 mr-2.5 text-navy-400" />
              Doctor Profile & Credentials
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center px-4 py-2 text-xs text-navy-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2.5 text-navy-400" />
              Clinic Settings
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2.5 text-red-500" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
