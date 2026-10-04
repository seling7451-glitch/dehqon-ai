import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ScanRecord = {
  id: string;
  imageUri: string;
  plant: string;
  disease: string;
  confidence: number;
  advice: string;
  createdAt: string;
};

type AppContextValue = {
  history: ScanRecord[];
  addScan: (scan: Omit<ScanRecord, 'id' | 'createdAt'>) => Promise<void>;
  clearHistory: () => Promise<void>;
};

const HISTORY_KEY = '@dehqon-ai/history';
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<ScanRecord[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as ScanRecord[];
        setHistory(Array.isArray(parsed) ? parsed : []);
      })
      .catch(() => setHistory([]));
  }, []);

  const save = async (nextHistory: ScanRecord[]) => {
    setHistory(nextHistory);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const addScan = async (scan: Omit<ScanRecord, 'id' | 'createdAt'>) => {
    const record: ScanRecord = {
      ...scan,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    await save([record, ...history].slice(0, 30));
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  const value = useMemo(() => ({ history, addScan, clearHistory }), [history]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp AppProvider ichida ishlatilishi kerak.');
  return context;
}