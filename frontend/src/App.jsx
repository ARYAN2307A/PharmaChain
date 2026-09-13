import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Medicines from "./pages/Medicines";
import CreateMedicine from "./pages/CreateMedicine";
import Batches from "./pages/Batches";
import CreateBatch from "./pages/CreateBatch";
import BatchDetails from "./pages/BatchDetails";
import Transfers from "./pages/Transfers";
import QRScanner from "./pages/QRScanner";
import Verification from "./pages/Verification";
import MedicinePassport from "./pages/MedicinePassport";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function Protected({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* AUTHENTICATED */}
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />

          <Route
            path="/medicines"
            element={
              <Protected>
                <Medicines />
              </Protected>
            }
          />

          <Route
            path="/medicines/create"
            element={
              <Protected>
                <CreateMedicine />
              </Protected>
            }
          />

          <Route
            path="/medicines/:id"
            element={
              <Protected>
                <MedicinePassport />
              </Protected>
            }
          />

          <Route
            path="/batches"
            element={
              <Protected>
                <Batches />
              </Protected>
            }
          />

          <Route
            path="/batches/create"
            element={
              <Protected>
                <CreateBatch />
              </Protected>
            }
          />

          <Route
            path="/batches/:id"
            element={
              <Protected>
                <BatchDetails />
              </Protected>
            }
          />

          <Route
            path="/transfers"
            element={
              <Protected>
                <Transfers />
              </Protected>
            }
          />

          <Route
            path="/scan"
            element={
              <Protected>
                <QRScanner />
              </Protected>
            }
          />

          <Route
            path="/verify"
            element={
              <Protected>
                <Verification />
              </Protected>
            }
          />

          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
