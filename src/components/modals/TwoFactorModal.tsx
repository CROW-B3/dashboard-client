'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Shield, QrCode, Key } from 'lucide-react';
import { cn, Button, StatusBadge } from '@b3-crow/ui-kit';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (secret: string) => void;
  isEnabled?: boolean;
}

export function TwoFactorModal({
  isOpen,
  onClose,
  onComplete,
  isEnabled = false,
}: TwoFactorModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Mock secret key
  const mockSecret = 'JBSWY3DPEHPK3PXP';

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setStep(isEnabled ? 'verify' : 'setup');
      setSecret(mockSecret);
      modalRef.current?.focus();
    }
  }, [isOpen, isEnabled]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
      setVerificationCode('');
      setIsCopied(false);
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      if (verificationCode === '123456') { // Mock verification code
        onComplete(secret);
        handleClose();
      } else {
        alert('Invalid code. Please try again.');
      }
    }, 1500);
  };

  const handleSetup = () => {
    setStep('verify');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        role="presentation"
        aria-hidden="true"
        onClick={handleClose}
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-200',
          isClosing ? 'opacity-0' : 'opacity-100'
        )}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="2fa-modal-title"
        tabIndex={-1}
        className={cn(
          'fixed top-1/2 left-1/2 w-[450px] max-w-[90vw] z-[101]',
          'bg-[rgba(10,5,20,0.98)] backdrop-blur-[20px] rounded-2xl',
          'border border-white/[0.08]',
          'shadow-[0px_24px_48px_rgba(0,0,0,0.5),0px_0px_1px_rgba(139,92,246,0.3)]',
          'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isClosing
            ? 'opacity-0 -translate-x-1/2 -translate-y-1/2 scale-95'
            : 'opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2
            id="2fa-modal-title"
            className="text-white text-lg font-semibold font-[Sora,sans-serif] m-0"
          >
            {isEnabled ? 'Configure 2FA' : 'Enable Two-Factor Authentication'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close 2FA setup"
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg cursor-pointer transition-colors hover:bg-white/[0.06]"
          >
            <X size={18} className="text-gray-500" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6">
          {step === 'setup' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Setup Authenticator App</h3>
                  <p className="text-sm text-gray-400">Scan the QR code or enter the secret key manually</p>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={secret}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-gray-200 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySecret}
                    className="border-white/20"
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                  <strong>Tip:</strong> Use Google Authenticator, Authy, or any TOTP app to scan this code.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Key className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Enter Verification Code</h3>
                  <p className="text-sm text-gray-400">Enter the 6-digit code from your authenticator app</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-mono bg-white/[0.02] border border-white/10 rounded-lg text-gray-200 focus:border-violet-500/50 focus:ring-violet-500/50"
                />
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400">
                  <strong>For demo:</strong> Enter "123456" as the verification code
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06]">
          <Button
            variant="outline"
            size="md"
            onClick={handleClose}
            className="border-white/20"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={step === 'setup' ? handleSetup : handleVerify}
            disabled={step === 'verify' ? verificationCode.length !== 6 : false}
            className="flex-1"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              step === 'setup' ? 'Next' : 'Verify & Enable'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}