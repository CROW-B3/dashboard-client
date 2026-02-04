'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button, Input, cn } from '@b3-crow/ui-kit';
import { X } from 'lucide-react';

interface Enable2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (code: string) => void;
}

export function Enable2FAModal({ isOpen, onClose, onConfirm }: Enable2FAModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setVerificationCode('');
      setError('');
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  const handleConfirm = () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    onConfirm?.(verificationCode);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-200',
          isClosing ? 'opacity-0' : 'opacity-100',
        )}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[480px] max-w-[90vw] z-[101]',
          'bg-[rgba(10,5,20,0.98)] backdrop-blur-[20px]',
          'border border-white/[0.08] rounded-2xl',
          'shadow-[0px_24px_48px_rgba(0,0,0,0.5)]',
          'transition-all duration-200',
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <h2 className="text-lg font-semibold text-white">
            Enable Two-Factor Authentication
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">QR Code</p>
                <p className="text-xs text-gray-500">
                  Scan with your authenticator app
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">How to set up:</h4>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Scan the QR code above with your app</li>
              <li>Enter the 6-digit code below to confirm</li>
            </ol>
          </div>

          {/* Verification Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <Input
              variant="primary"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(val);
                if (error) setError('');
              }}
              maxLength={6}
              error={error}
            />
          </div>

          {/* Backup Codes */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-300 mb-2">
              ⚠️ Save your backup codes
            </p>
            <p className="text-xs text-amber-200">
              Keep these codes in a safe place. You can use them to regain access if you lose your authenticator.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/[0.08]">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Enable 2FA
          </Button>
        </div>
      </div>
    </>
  );
}
