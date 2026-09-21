import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppShell({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <div className="page-container">
          <Navbar />
          {children}
        </div>
      </main>
    </div>
  );
}
