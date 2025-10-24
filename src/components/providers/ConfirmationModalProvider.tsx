"use client";

import {
  ConfirmationModal,
  ConfirmationModalProps,
} from "@/components/ui/confirmation-modal";
import { createContext, ReactNode, useContext, useState } from "react";

interface ConfirmationModalContextType {
  showConfirmation: (
    props: Omit<ConfirmationModalProps, "open" | "onOpenChange">
  ) => Promise<boolean>;
  hideConfirmation: () => void;
}

const ConfirmationModalContext = createContext<
  ConfirmationModalContextType | undefined
>(undefined);

interface ConfirmationModalProviderProps {
  children: ReactNode;
}

export function ConfirmationModalProvider({
  children,
}: ConfirmationModalProviderProps) {
  const [modalProps, setModalProps] = useState<Omit<
    ConfirmationModalProps,
    "open" | "onOpenChange"
  > | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showConfirmation = (
    props: Omit<ConfirmationModalProps, "open" | "onOpenChange">
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalProps(props);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const hideConfirmation = () => {
    setIsOpen(false);
    setModalProps(null);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  };

  const handleConfirm = () => {
    if (modalProps?.onConfirm) {
      modalProps.onConfirm();
    }
    setIsOpen(false);
    setModalProps(null);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  };

  const handleCancel = () => {
    if (modalProps?.onCancel) {
      modalProps.onCancel();
    }
    hideConfirmation();
  };

  return (
    <ConfirmationModalContext.Provider
      value={{ showConfirmation, hideConfirmation }}
    >
      {children}
      {modalProps && (
        <ConfirmationModal
          {...modalProps}
          open={isOpen}
          onOpenChange={setIsOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationModalContext.Provider>
  );
}

export function useConfirmationModal() {
  const context = useContext(ConfirmationModalContext);
  if (context === undefined) {
    throw new Error(
      "useConfirmationModal must be used within a ConfirmationModalProvider"
    );
  }
  return context;
}
