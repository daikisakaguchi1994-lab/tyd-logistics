'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { SendMessageModal } from './SendMessageModal';
import { DriverAnalysisModal } from './DriverAnalysisModal';

interface MessageTarget {
  driverName: string;
  userId: string;
  context: string;
}

interface AnalysisTarget {
  driverName: string;
  userId: string;
}

interface MessageContextType {
  openSendMessage: (target: MessageTarget) => void;
  openAnalysis: (target: AnalysisTarget) => void;
}

const MessageContext = createContext<MessageContextType>({
  openSendMessage: () => {},
  openAnalysis: () => {},
});

export function useMessage() {
  return useContext(MessageContext);
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<MessageTarget | null>(null);
  const [analysisTarget, setAnalysisTarget] = useState<AnalysisTarget | null>(null);

  return (
    <MessageContext.Provider value={{
      openSendMessage: setTarget,
      openAnalysis: setAnalysisTarget,
    }}>
      {children}
      {target && (
        <SendMessageModal
          driverName={target.driverName}
          userId={target.userId}
          context={target.context}
          onClose={() => setTarget(null)}
        />
      )}
      {analysisTarget && (
        <DriverAnalysisModal
          driverName={analysisTarget.driverName}
          userId={analysisTarget.userId}
          onClose={() => setAnalysisTarget(null)}
        />
      )}
    </MessageContext.Provider>
  );
}
