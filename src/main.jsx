import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/auth.css'
import './styles/theme.css'
import './styles/shell.css'
import './styles/dashboard.css'
import './styles/usermanagement.css'
import './styles/excelimport.css'
import './styles/invoice.css'
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
import "./styles/mobile.css";
import "./styles/auditlog.css";
import { AuditLogProvider } from './context/AuditLogContext.jsx'
import "./styles/barcode.css";

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
                        <AuditLogProvider>
                          <App />
                        </AuditLogProvider>
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