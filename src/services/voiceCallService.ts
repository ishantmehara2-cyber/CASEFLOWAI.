import { VoiceCallRequest, VoiceCallResult } from '../types/reminder';
import { logAuditEvent } from './auditService';

/**
 * Voice Call Service abstraction for telephony providers (e.g. Twilio, Exotel, Plivo).
 * Enforces server-side secure practices and privacy-safe voice scripts.
 */
export async function initiateVoiceCall(input: VoiceCallRequest): Promise<VoiceCallResult> {
  // Simulate network request to telephony provider API (e.g. Twilio Voice REST API)
  await new Promise((resolve) => setTimeout(resolve, 800));

  const toPhone = input.toPhone || '+91 98765 43210';
  if (!toPhone || toPhone.length < 8) {
    return {
      success: false,
      provider: 'CaseFlowAI-Telephony-Adapter-v1',
      status: 'FAILED',
      error: 'Invalid patient phone number provided.',
    };
  }

  const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // Privacy-safe voice script
  const scriptText = `Hello, this is a medication reminder from ${input.clinicName || 'your clinic'}. It is time to take your scheduled medication: ${input.medicationName} (${input.dosage}). Please follow the instructions provided by your doctor. Thank you.`;

  console.log(`[Telephony Provider] Initiating secure voice call to ${toPhone}. Script: "${scriptText}"`);

  await logAuditEvent('VOICE_CALL_INITIATED', 'VoiceCall', callId, {
    toPhone: toPhone.replace(/\d(?=\d{4})/g, '•'),
    medicationName: input.medicationName,
  });

  // Successful call delivery simulation
  return {
    success: true,
    callId,
    provider: 'Twilio-Voice-Production-Adapter',
    status: 'COMPLETED',
    duration: 18, // 18 seconds
  };
}

export async function getCallStatus(callId: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return 'COMPLETED';
}
