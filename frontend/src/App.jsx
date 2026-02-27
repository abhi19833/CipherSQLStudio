import { Navigate, Route, Routes } from "react-router-dom";
import AssignmentAttemptPage from "./pages/AssignmentAttemptPage";
import AssignmentListPage from "./pages/AssignmentListPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AssignmentListPage />} />
      <Route path="/assignments/:id" element={<AssignmentAttemptPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
