import React, { createContext } from 'react'
import usePersistentState from '../hooks/usePersistentState';

const DecisionLogContext = createContext();

export const DecisionLogProvider = ({ children }) => {
    const [decisions, setDecisions] = usePersistentState('stockpro:decisions', []);

    const logDecision = ({ alertType, alertRefId, summary, action, actor }) => {
        const entry = {
            id: `DEC-${Date.now()}`,
            alertType,
            alertRefId,
            summary,
            action,
            actor: actor || "Manager",
            timestamp: new Date().toISOString(),
        };
        setDecisions([entry, ...decisions]);
        return entry;
    };

    const isResolved = (alertRefId) => 
        decisions.some((d) => d.alertRefId === alertRefId);
    
    return (
        <DecisionLogContext.Provider value={{ decisions, logDecision, isResolved }}>
            {children}
        </DecisionLogContext.Provider>
    );
};

export default DecisionLogContext