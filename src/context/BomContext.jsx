import React, { createContext } from 'react'
import usePersistentState from '../hooks/usePersistentState';
import { seedBoms } from '../data/seed';
import { validBoms } from '../utils/validators';

const BomContext = createContext();

export const BomProvider = ({children}) => {
    const [boms, setBoms] = usePersistentState('stockpro:boms', seedBoms, validBoms);
  return (
    <BomContext.Provider value = {{boms, setBoms}}>
        {children}
    </BomContext.Provider>
  )
}

export default BomContext
