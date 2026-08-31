 import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Memory from "./pages/memory";
import Goals from "./pages/goal";
import Tasks from "./pages/tasks";
import Activity from "./pages/Activity";


function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
                  />

        <Route
          path="/memory"
            element={
              <ProtectedRoute>
                <Memory />
              </ProtectedRoute>
          }
/>

<Route path="/activity" element={<Activity />} />

<Route
  path="/goals"
  element={
    <ProtectedRoute>
      <Goals />
    </ProtectedRoute>
  }
/>

<Route
  path="/tasks"
  element={
    <ProtectedRoute>
      <Tasks />
    </ProtectedRoute>
  }

/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;