import { Prescription } from '../types/consultation';
import { Patient, Doctor } from '../types';

/**
 * Generates and opens a professional printable HTML prescription document window.
 */
export function generatePrescriptionHtml(
  prescription: Prescription,
  patient: Patient,
  doctor: Doctor
): string {
  const itemsHtml = prescription.items
    .map(
      (item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; font-weight: bold; color: #0f172a; width: 40px; vertical-align: top;">${idx + 1}.</td>
          <td style="padding: 10px 8px; vertical-align: top;">
            <div style="font-weight: bold; font-size: 14px; color: #0f172a;">${item.medicineName} ${item.strength ? `<span style="font-weight: normal; color: #475569;">(${item.strength})</span>` : ''}</div>
            ${item.genericName ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Generic: ${item.genericName}</div>` : ''}
            ${item.notes ? `<div style="font-size: 11px; color: #475569; font-style: italic; margin-top: 2px;">Note: ${item.notes}</div>` : ''}
          </td>
          <td style="padding: 10px 8px; color: #0f172a; vertical-align: top; font-weight: 600;">${item.dosage} • ${item.frequency}</td>
          <td style="padding: 10px 8px; color: #0f172a; vertical-align: top;">${item.duration}</td>
          <td style="padding: 10px 8px; color: #0f172a; vertical-align: top; font-size: 12px;">${item.foodInstruction || 'As directed'}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Prescription ${prescription.prescriptionNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #ffffff; }
        .rx-container { max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
        .clinic-info h1 { margin: 0; font-size: 22px; font-extrabold; color: #0f172a; letter-spacing: -0.5px; }
        .clinic-info p { margin: 3px 0; font-size: 12px; color: #475569; }
        .doctor-info { text-align: right; }
        .doctor-info h3 { margin: 0; font-size: 16px; font-bold; color: #0f172a; }
        .doctor-info p { margin: 2px 0; font-size: 12px; color: #475569; }
        .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 13px; }
        .patient-box div p { margin: 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold; }
        .patient-box div span { font-weight: bold; color: #0f172a; }
        .assessment-box { margin-bottom: 24px; background: #fdf4ff; border: 1px solid #f0abfc; padding: 14px; border-radius: 8px; }
        .assessment-box h4 { margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; color: #86198f; font-weight: bold; }
        .assessment-box p { margin: 0; font-size: 13px; color: #581c87; font-weight: 600; }
        .rx-symbol { font-size: 28px; font-weight: bold; color: #0f172a; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
        th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 12px; color: #475569; }
        .signature-box { text-align: right; }
        .signature-line { width: 180px; border-bottom: 1px solid #94a3b8; margin-bottom: 6px; margin-left: auto; }
        @media print {
          body { padding: 0; background: transparent; }
          .rx-container { border: none; box-shadow: none; padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="rx-container">
        <!-- Header -->
        <div class="header">
          <div class="clinic-info">
            <h1>${doctor.clinicName || 'Apollo Clinical Care Center'}</h1>
            <p>${doctor.clinicAddress || '42 Health Care Avenue, New Delhi'}</p>
            <p>Email: ${doctor.email || 'contact@apollocare.med'} • Ph: ${doctor.phone || '+91 98765 43210'}</p>
          </div>
          <div class="doctor-info">
            <h3>Dr. ${doctor.firstName || 'Priya'} ${doctor.lastName || 'Sharma'}</h3>
            <p>${doctor.specialization}</p>
            <p>${doctor.qualification || 'MBBS, MD'}</p>
            <p><strong>Reg. No:</strong> ${doctor.medicalRegistrationNumber || 'MCI-884920'}</p>
          </div>
        </div>

        <!-- Patient Box -->
        <div class="patient-box">
          <div>
            <p>Patient Name</p>
            <span>${patient.name}</span>
          </div>
          <div>
            <p>Patient ID</p>
            <span style="font-family: monospace;">${patient.patientId}</span>
          </div>
          <div>
            <p>Age / Gender</p>
            <span>${patient.age || 35} yrs • ${patient.gender || 'Not specified'}</span>
          </div>
          <div>
            <p>Prescription No</p>
            <span style="font-family: monospace; color: #2563eb;">${prescription.prescriptionNumber}</span>
          </div>
          <div>
            <p>Date & Time</p>
            <span>${new Date(prescription.prescriptionDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div>
            <p>Allergies</p>
            <span style="color: #dc2626;">${patient.allergiesText || 'None recorded'}</span>
          </div>
        </div>

        <!-- Clinical Assessment -->
        ${prescription.clinicalAssessment ? `
          <div class="assessment-box">
            <h4>Clinical Assessment & Diagnosis</h4>
            <p>${prescription.clinicalAssessment}</p>
          </div>
        ` : ''}

        <!-- Rx Symbol -->
        <div class="rx-symbol">℞</div>

        <!-- Medications Table -->
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine Name</th>
              <th>Dosage & Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Instructions & Follow-up -->
        ${prescription.instructions || prescription.followUp ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-bottom: 24px; font-size: 13px;">
            ${prescription.instructions ? `<p style="margin: 0 0 6px 0;"><strong>General Instructions:</strong> ${prescription.instructions}</p>` : ''}
            ${prescription.followUp ? `<p style="margin: 0;"><strong>Follow-up:</strong> ${prescription.followUp}</p>` : ''}
          </div>
        ` : ''}

        <!-- Footer / Signature -->
        <div class="footer">
          <div>
            <p style="margin: 0; font-size: 11px; color: #64748b;">CaseFlowAI Clinical System • AI Structures. Doctor Decides.</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #94a3b8;">Digitally verified prescription document.</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p style="margin: 0; font-weight: bold; color: #0f172a;">Dr. ${doctor.firstName || 'Priya'} ${doctor.lastName || 'Sharma'}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #475569;">Authorized Signature</p>
          </div>
        </div>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="background: #2563eb; color: #white; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Print / Save PDF</button>
      </div>
    </body>
    </html>
  `;
}

export function openPrescriptionPrintWindow(
  prescription: Prescription,
  patient: Patient,
  doctor: Doctor
): void {
  const htmlContent = generatePrescriptionHtml(prescription, patient, doctor);
  const win = window.open('', '_blank', 'width=850,height=900');
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
  }
}
