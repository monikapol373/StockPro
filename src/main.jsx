import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/auth.css'
import './styles/theme.css'
import './styles/shell.css'
import './styles/dashboard.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { InventoryProvider } from './context/InventoryContext.jsx'
import { OrdersProvider } from './context/OrdersContext.jsx'
import { SuppliersProvider } from './context/SuppliersContext.jsx'
import { BomProvider } from './context/BomContext.jsx'
import { ProductionProvider } from './context/ProductionContext.jsx'
import { CustomerOrdersProvider } from './context/CustomerOrdersContext.jsx'
import { DecisionLogProvider } from './context/DecisionLogContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <InventoryProvider>
            <ProductionProvider>
              <CustomerOrdersProvider>
                <OrdersProvider>
                  <SuppliersProvider>
                    <BomProvider>
                      <DecisionLogProvider>
                        <App />
                      </DecisionLogProvider>
                    </BomProvider>
                  </SuppliersProvider>
                </OrdersProvider>
              </CustomerOrdersProvider>
            </ProductionProvider>
          </InventoryProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
