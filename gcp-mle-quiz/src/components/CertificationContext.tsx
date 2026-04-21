"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type CertificationType = "MLE" | "DE" | null;

interface CertificationContextType {
  certificationType: CertificationType;
  setCertificationType: (type: CertificationType) => void;
}

const CertificationContext = createContext<CertificationContextType | undefined>(undefined);

export function CertificationProvider({ children }: { children: ReactNode }) {
  const [certificationType, setCertificationType] = useState<CertificationType>(null);

  return (
    <CertificationContext.Provider value={{ certificationType, setCertificationType }}>
      {children}
    </CertificationContext.Provider>
  );
}

export function useCertification() {
  const context = useContext(CertificationContext);
  if (context === undefined) {
    throw new Error("useCertification must be used within CertificationProvider");
  }
  return context;
}
