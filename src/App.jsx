import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import AppLayout from "./components/AppLayout";
import Bom from "./pages/Bom";
import Production from "./pages/Production";
import ProductionPlanner from "./pages/ProductionPlanner";
import CustomerOrders from "./pages/CustomerOrders";
import Movements from "./pages/Movements";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import RealityCheck from "./pages/RealityCheck";
import Bottleneck from "./pages/Bottleneck";
import Assistant from "./pages/Assistant";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import SmartReorder from "./pages/SmartReorder";
import UserManagement from "./pages/UserManagement";

const App = () => {
  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/bom" element={<Bom />} />
          <Route path="/production" element={<Production />} />
          <Route path="/production-planner" element={<ProductionPlanner />} />
          <Route path="/customer-orders" element={<CustomerOrders />} />
          <Route path="/movements" element={<Movements />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reality-check" element={<RealityCheck />} />
          <Route path="/bottleneck" element={<Bottleneck />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/reorder" element={<SmartReorder />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;