import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import TicketsPage from "./pages/TicketsPage";
import TicketPage from "./pages/TicketPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/tickets" replace />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/ticket/:id" element={<TicketPage />} />
      </Routes>
    </>
  );
}

export default App;
