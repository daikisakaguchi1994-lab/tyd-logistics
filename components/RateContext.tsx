'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { PLAYERS } from '@/src/mockData';

interface RateContextType {
  clientRate: number;
  setClientRate: (rate: number) => void;
  driverRates: Record<string, number>;
  setDriverRate: (name: string, rate: number) => void;
  setAllDriverRates: (rate: number) => void;
  getMargin: (name: string) => number;
}

const defaultDriverRates: Record<string, number> = {};
PLAYERS.forEach(p => { defaultDriverRates[p.name] = 160; });

const RateContext = createContext<RateContextType>({
  clientRate: 180,
  setClientRate: () => {},
  driverRates: defaultDriverRates,
  setDriverRate: () => {},
  setAllDriverRates: () => {},
  getMargin: () => 20,
});

export function useRates() {
  return useContext(RateContext);
}

export function RateProvider({ children }: { children: ReactNode }) {
  const [clientRate, setClientRate] = useState(180);
  const [driverRates, setDriverRates] = useState<Record<string, number>>(() => {
    const rates: Record<string, number> = {};
    PLAYERS.forEach(p => { rates[p.name] = 160; });
    return rates;
  });

  const setDriverRate = (name: string, rate: number) => {
    setDriverRates(prev => ({ ...prev, [name]: rate }));
  };

  const setAllDriverRates = (rate: number) => {
    setDriverRates(prev => {
      const next: Record<string, number> = {};
      Object.keys(prev).forEach(k => { next[k] = rate; });
      return next;
    });
  };

  const getMargin = (name: string) => clientRate - (driverRates[name] ?? 160);

  return (
    <RateContext.Provider value={{ clientRate, setClientRate, driverRates, setDriverRate, setAllDriverRates, getMargin }}>
      {children}
    </RateContext.Provider>
  );
}
