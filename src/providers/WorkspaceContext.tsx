'use client';
import React, { ReactNode, useState, createContext, useContext } from 'react';

// Define the context type
interface WorkspaceContextType {
  projectId: string | null;
  setProjectId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the context with a default value
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspaceContext = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a ProjectProvider');
  }
  return context;
};

export default function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState<string | null>(null);

  return (
    <WorkspaceContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
