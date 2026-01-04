import Home from "./pages/Home";
import AdminDashboard from "./components/AdminDashboard";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </Router>
  );
}
