import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RespondentDashboard from "./pages/RespondentDashboard";
import ReportForm from "./pages/ReportForm";
import AdminLayout from "./pages/AdminLayout";
import RespondentLayout from "./pages/RespondentLayout";
import ResidentLayout from "./pages/ResidentLayout";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import RespondentLogin from "./pages/RespondentLogin";
import RespondentRegister from "./pages/RespondentRegister";
import UserManagement from "./pages/UserManagement";
import MyReports from "./pages/MyReports";
import RespondentNews from "./pages/RespondentNews";
import RespondentProfile from "./pages/RespondentProfile";
import CreateNews from "./pages/CreateNews";
import SendMessage from "./pages/SendMessage";
import EmergencyAlerts from "./pages/EmergencyAlerts";
import AddRespondent from "./pages/AddRespondent";
import ResidentMessage from "./pages/ResidentMessage";
import ResidentMessages from "./pages/ResidentMessages";
import RespondentMessageAdmin from "./pages/RespondentMessageAdmin";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === "admin") {
      return <Navigate to="/dashboard" />;
    } else if (userRole === "respondent") {
      return <Navigate to="/respondent" />;
    } else {
      return <Navigate to="/resident" />;
    }
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/respondent-login" element={<RespondentLogin />} />
        <Route path="/respondent-register" element={<RespondentRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute requiredRole="admin">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/users"
          element={
            <RoleRoute requiredRole="admin">
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/news"
          element={
            <RoleRoute requiredRole="admin">
              <AdminLayout>
                <CreateNews />
              </AdminLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/send-message"
          element={
            <RoleRoute requiredRole="admin">
              <AdminLayout>
                <SendMessage />
              </AdminLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/emergency-alerts"
          element={
            <RoleRoute requiredRole="admin">
              <AdminLayout>
                <EmergencyAlerts />
              </AdminLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/resident-messages"
          element={
            <RoleRoute requiredRole="admin">
              <AdminLayout>
                <ResidentMessages />
              </AdminLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/add-respondent"
          element={
            <RoleRoute requiredRole="admin">
              <AdminLayout>
                <AddRespondent />
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Resident Routes */}
        <Route
          path="/resident"
          element={
            <RoleRoute requiredRole="resident">
              <ResidentLayout>
                <Dashboard />
              </ResidentLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/my-reports"
          element={
            <RoleRoute requiredRole="resident">
              <ResidentLayout>
                <MyReports />
              </ResidentLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ResidentLayout>
                <Profile />
              </ResidentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resident/message"
          element={
            <RoleRoute requiredRole="resident">
              <ResidentLayout>
                <ResidentMessage />
              </ResidentLayout>
            </RoleRoute>
          }
        />

        {/* Respondent Routes */}
        <Route
          path="/respondent"
          element={
            <RoleRoute requiredRole="respondent">
              <RespondentLayout>
                <RespondentDashboard />
              </RespondentLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/respondent/queue"
          element={
            <RoleRoute requiredRole="respondent">
              <RespondentLayout>
                <RespondentDashboard />
              </RespondentLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/respondent/responses"
          element={
            <RoleRoute requiredRole="respondent">
              <RespondentLayout>
                <RespondentDashboard />
              </RespondentLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/respondent/news"
          element={
            <RoleRoute requiredRole="respondent">
              <RespondentLayout>
                <RespondentNews />
              </RespondentLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/respondent/profile"
          element={
            <RoleRoute requiredRole="respondent">
              <RespondentLayout>
                <RespondentProfile />
              </RespondentLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/respondent/message"
          element={
            <RoleRoute requiredRole="respondent">
              <RespondentLayout>
                <RespondentMessageAdmin />
              </RespondentLayout>
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
