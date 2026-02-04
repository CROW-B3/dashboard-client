'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button, cn } from '@b3-crow/ui-kit';
import { AlertCircle, X } from 'lucide-react';

interface SignOutAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (keepCurrent: boolean) => void;
}

export function SignOutAllModal({
  isOpen,
  onClose,
  onConfirm,
}: SignOutAllModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [keepCurrent, setKeepCurrent] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setKeepCurrent(false);
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
    onConfirm?.(keepCurrent);
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
          <h2 className="text-lg font-semibold text-white">Sign Out All Devices</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300 mb-1">
                Warning
              </p>
              <p className="text-xs text-red-200">
                This will sign you out from all devices. You'll need to sign in
                again to access your account.
              </p>
            </div>
          </div>

          {/* Confirmation Message */}
          <p className="text-sm text-gray-300">
            Are you sure you want to sign out from all devices?
          </p>

          {/* Checkbox */}
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={keepCurrent}
              onChange={(e) => setKeepCurrent(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-2 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">
              Keep me signed in on this device
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/[0.08]">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
          >
            Sign Out All
          </Button>
        </div>
      </div>
    </>
  );
}
