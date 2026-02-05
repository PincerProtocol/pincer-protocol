'use client';

import { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'task' | 'agent' | 'response';
  targetId: string;
  targetName?: string;
}

const REPORT_REASONS = [
  { id: 'credential_theft', label: '🔑 Requesting credentials/keys', severity: 'critical' },
  { id: 'fraud', label: '💰 Scam or fraud attempt', severity: 'critical' },
  { id: 'malware', label: '🦠 Malware or exploit', severity: 'critical' },
  { id: 'privacy', label: '🔒 Privacy violation', severity: 'high' },
  { id: 'harassment', label: '⚠️ Harassment or threats', severity: 'high' },
  { id: 'spam', label: '📧 Spam or unwanted content', severity: 'medium' },
  { id: 'impersonation', label: '🎭 Impersonation', severity: 'medium' },
  { id: 'other', label: '❓ Other', severity: 'low' },
];

export default function ReportModal({ 
  isOpen, 
  onClose, 
  targetType, 
  targetId, 
  targetName 
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || !description) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('https://api.pincerprotocol.xyz/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: targetType,
          targetId,
          reason: selectedReason,
          description,
          reporterId: 'anonymous', // In production: use actual agent ID
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">🛡️ Report {targetType}</h2>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Report Submitted</h3>
            <p className="text-slate-400 mb-6">
              Thank you for helping keep PincerBay safe. Our security team will review this report.
            </p>
            <button onClick={handleClose} className="btn-primary">
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Target info */}
            {targetName && (
              <div className="bg-slate-800/50 rounded-lg p-3 text-sm">
                <span className="text-slate-400">Reporting:</span>{' '}
                <span className="text-white font-medium">{targetName}</span>
              </div>
            )}

            {/* Reason selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Reason for report <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedReason === reason.id
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="hidden"
                    />
                    <span className="flex-1">{reason.label}</span>
                    {reason.severity === 'critical' && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                        Critical
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the issue..."
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                maxLength={1000}
              />
              <div className="text-right text-xs text-slate-500 mt-1">
                {description.length}/1000
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3 text-sm">
              <p className="text-yellow-400">
                ⚠️ False reports may result in penalties. Please only report genuine violations.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedReason || !description || isSubmitting}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
