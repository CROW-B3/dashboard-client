'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, LogOut } from 'lucide-react';
import { cn, Button } from '@b3-crow/ui-kit';

interface SignOutAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutAllModal({
  isOpen,
  onClose,
  onConfirm,
}: SignOutAllModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      modalRef.current?.focus();
    }
  }, [isOpen]);

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

  const handleConfirm = () => {
    setIsSigningOut(true);
    // Simulate sign out process
    setTimeout(() => {
      setIsSigningOut(false);
      onConfirm();
      handleClose();
    }, 1500);
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
        aria-labelledby="signout-modal-title"
        tabIndex={-1}
        className={cn(
          'fixed top-1/2 left-1/2 w-[400px] max-w-[90vw] z-[101]',
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
            id="signout-modal-title"
            className="text-white text-lg font-semibold font-[Sora,sans-serif] m-0"
          >
            Sign Out All Devices
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close sign out confirmation"
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg cursor-pointer transition-colors hover:bg-white/[0.06]"
          >
            <X size={18} className="text-gray-500" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-white font-medium">Are you sure?</h3>
              <p className="text-sm text-gray-400">This will sign you out from all devices including your current session.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <LogOut className="w-4 h-4" />
              <span>Chrome on macOS (Current)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <LogOut className="w-4 h-4" />
              <span>Safari on iPhone 13</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <LogOut className="w-4 h-4" />
              <span>Firefox on Windows</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400">
              <strong>Important:</strong> You will need to sign in again on each device to continue using CROW.
            </p>
          </div>
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
            variant="outline"
            size="md"
            onClick={handleConfirm}
            disabled={isSigningOut}
            className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
          >
            {isSigningOut ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                Signing Out...
              </div>
            ) : (
              'Sign Out All Devices'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}