import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedContextType {
  savedIds: Set<string>;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  loadSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

const STORAGE_KEY = '@availo_saved_spots';

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const loadSaved = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setSavedIds(new Set(ids));
      }
    } catch (error) {
      console.error('Failed to load saved spots:', error);
    }
  }, []);

  const saveToDisk = useCallback(async (ids: Set<string>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch (error) {
      console.error('Failed to save spots:', error);
    }
  }, []);

  const isSaved = useCallback((id: string) => {
    return savedIds.has(id);
  }, [savedIds]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      saveToDisk(newSet);
      return newSet;
    });
  }, [saveToDisk]);

  // Load on mount
  React.useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  return (
    <SavedContext.Provider value={{ savedIds, isSaved, toggleSaved, loadSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (context === undefined) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}
