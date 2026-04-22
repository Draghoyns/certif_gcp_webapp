"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { getTagsForCertification } from "@/lib/types";
import { useCertification } from "./CertificationContext";

interface TagContextType {
  availableTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  selectAll: () => void;
  clearAll: () => void;
}

const DEFAULT_TAGS = getTagsForCertification("MLE");

const TagContext = createContext<TagContextType>({
  availableTags: [...DEFAULT_TAGS],
  selectedTags: [...DEFAULT_TAGS],
  toggleTag: () => {},
  selectAll: () => {},
  clearAll: () => {},
});

export function TagProvider({ children }: { children: ReactNode }) {
  const { certificationType } = useCertification();
  const availableTags = useMemo(
    () => getTagsForCertification(certificationType),
    [certificationType]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([...availableTags]);

  useEffect(() => {
    setSelectedTags([...availableTags]);
  }, [certificationType, availableTags]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const selectAll = useCallback(() => setSelectedTags([...availableTags]), [availableTags]);
  const clearAll = useCallback(() => setSelectedTags([]), []);

  return (
    <TagContext.Provider
      value={{ availableTags, selectedTags, toggleTag, selectAll, clearAll }}
    >
      {children}
    </TagContext.Provider>
  );
}

export const useTagContext = () => useContext(TagContext);
