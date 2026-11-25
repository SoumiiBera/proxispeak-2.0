
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VirtualOffice from "./pages/VirtualOffice";
import VirtualOffice3D from "./pages/VirtualOffice3D";
import TeamMembers from "./pages/TeamMembers";
import Meetings from "./pages/Meetings";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";

import "./App.css";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/office" element={<VirtualOffice />} />
        <Route path="/virtual-office-3d" element={<VirtualOffice3D />} />
        <Route path="/team" element={<TeamMembers />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
