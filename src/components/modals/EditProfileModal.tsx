'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import { cn, Button, Input } from '@b3-crow/ui-kit';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
  initialData: ProfileData;
}

export interface ProfileData {
  name: string;
  email: string;
  timezone: string;
  language: string;
  avatar?: string;
}

export function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditProfileModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isUploading, setIsUploading] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setFormData(initialData);
      modalRef.current?.focus();
    }
  }, [isOpen, initialData]);

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

  const handleSave = () => {
    onSave(formData);
    handleClose();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
        setFormData(prev => ({
          ...prev,
          avatar: URL.createObjectURL(file)
        }));
      }, 1500);
    }
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
        aria-labelledby="edit-profile-modal-title"
        tabIndex={-1}
        className={cn(
          'fixed top-1/2 left-1/2 w-[500px] max-w-[90vw] z-[101]',
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
            id="edit-profile-modal-title"
            className="text-white text-lg font-semibold font-[Sora,sans-serif] m-0"
          >
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close edit profile"
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg cursor-pointer transition-colors hover:bg-white/[0.06]"
          >
            <X size={18} className="text-gray-500" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500/30">
                <img
                  src={formData.avatar || initialData.avatar}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera size={16} strokeWidth={2} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              variant="primary"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              variant="primary"
            />
            
            <Input
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              placeholder="Select timezone"
              variant="primary"
            />
            
            <Input
              label="Language"
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              placeholder="Select language"
              variant="primary"
            />
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
            variant="primary"
            size="md"
            onClick={handleSave}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
}