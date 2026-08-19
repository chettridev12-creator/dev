import React, { useState } from 'react';
import { LeadSubmission } from '../types';
import { FloatingWhatsAppTrigger } from './booking/FloatingWhatsAppTrigger';
import { BookingModal } from './booking/BookingModal';

export interface FloatingWhatsAppProps {
  onOpenAIChat?: () => void;
  onLeadCaptured?: (lead: LeadSubmission) => void;
  initialRoute?: string;
  initialVehicle?: string;
  isOpenOverride?: boolean;
  onCloseOverride?: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  onOpenAIChat,
  onLeadCaptured,
  initialRoute,
  initialVehicle,
  isOpenOverride,
  onCloseOverride,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Controlled or uncontrolled open state
  const isModalOpen = isOpenOverride !== undefined ? isOpenOverride : internalIsOpen;

  const handleOpen = () => {
    setInternalIsOpen(true);
  };

  const handleClose = () => {
    if (onCloseOverride) {
      onCloseOverride();
    }
    setInternalIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <FloatingWhatsAppTrigger onClick={handleOpen} />

      {/* Enterprise-grade Master Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleClose}
        initialRoute={initialRoute}
        initialVehicle={initialVehicle}
      />
    </>
  );
};
