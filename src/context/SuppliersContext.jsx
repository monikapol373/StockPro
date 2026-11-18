
import { createContext } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { seedSuppliers } from '../data/seed';
import { validList } from '../utils/validators';

const SuppliersContext = createContext();

export const SuppliersProvider = ({children}) => {

    const [suppliers, setSuppliers] = usePersistentState('stockpro:suppliers', seedSuppliers, validList)

  return (
    <SuppliersContext.Provider value = {{suppliers, setSuppliers}}>
      {children}
    </SuppliersContext.Provider>
  )
}

export default SuppliersContext
