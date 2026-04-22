"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { CertificationType as AppCertificationType } from "@/lib/types";

type CertificationType = AppCertificationType | null;

const STORAGE_KEY = "gcp-quiz-certification-type";

interface CertificationContextType {
  certificationType: CertificationType;
  setCertificationType: (type: CertificationType) => void;
}

const CertificationContext = createContext<CertificationContextType | undefined>(undefined);

export function CertificationProvider({ children }: { children: ReactNode }) {
  const [certificationType, setCertificationType] = useState<CertificationType>("MLE");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "MLE" || stored === "DE") {
      setCertificationType(stored);
    }
  }, []);

  useEffect(() => {
    if (!certificationType) return;
    window.localStorage.setItem(STORAGE_KEY, certificationType);
  }, [certificationType]);

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
