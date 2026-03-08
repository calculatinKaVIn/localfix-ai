import React, { createContext, useContext, useState, useCallback } from 'react';

export interface NotificationCounts {
  newReports: number;
  myReports: number;
  analytics: number;
}

interface NotificationContextType {
  counts: NotificationCounts;
  incrementNewReports: () => void;
  decrementNewReports: () => void;
  setNewReports: (count: number) => void;
  incrementMyReports: () => void;
  decrementMyReports: () => void;
  setMyReports: (count: number) => void;
  setAnalytics: (count: number) => void;
  resetCounts: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<NotificationCounts>({
    newReports: 0,
    myReports: 0,
    analytics: 0,
  });

  const incrementNewReports = useCallback(() => {
    setCounts(prev => ({ ...prev, newReports: prev.newReports + 1 }));
  }, []);

  const decrementNewReports = useCallback(() => {
    setCounts(prev => ({ ...prev, newReports: Math.max(0, prev.newReports - 1) }));
  }, []);

  const setNewReports = useCallback((count: number) => {
    setCounts(prev => ({ ...prev, newReports: Math.max(0, count) }));
  }, []);

  const incrementMyReports = useCallback(() => {
    setCounts(prev => ({ ...prev, myReports: prev.myReports + 1 }));
  }, []);

  const decrementMyReports = useCallback(() => {
    setCounts(prev => ({ ...prev, myReports: Math.max(0, prev.myReports - 1) }));
  }, []);

  const setMyReports = useCallback((count: number) => {
    setCounts(prev => ({ ...prev, myReports: Math.max(0, count) }));
  }, []);

  const setAnalytics = useCallback((count: number) => {
    setCounts(prev => ({ ...prev, analytics: Math.max(0, count) }));
  }, []);

  const resetCounts = useCallback(() => {
    setCounts({ newReports: 0, myReports: 0, analytics: 0 });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        counts,
        incrementNewReports,
        decrementNewReports,
        setNewReports,
        incrementMyReports,
        decrementMyReports,
        setMyReports,
        setAnalytics,
        resetCounts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
