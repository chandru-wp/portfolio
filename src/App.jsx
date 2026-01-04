 import Home from "./pages/Home";
 import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/admin') return <AdminDashboard />;
  return <Home />;
}
