"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ALL_TAGS } from "@/lib/types";

interface TagContextType {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  selectAll: () => void;
  clearAll: () => void;
}

const TagContext = createContext<TagContextType>({
  selectedTags: [...ALL_TAGS],
  toggleTag: () => {},
  selectAll: () => {},
  clearAll: () => {},
});

export function TagProvider({ children }: { children: ReactNode }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([...ALL_TAGS]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const selectAll = useCallback(() => setSelectedTags([...ALL_TAGS]), []);
  const clearAll = useCallback(() => setSelectedTags([]), []);

  return (
    <TagContext.Provider value={{ selectedTags, toggleTag, selectAll, clearAll }}>
      {children}
    </TagContext.Provider>
  );
}

export const useTagContext = () => useContext(TagContext);
