// src/routes/UserRoutes.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";

import { Account } from "@/pages/account";
import { DepotCreation } from "@/pages/depots";

export default function UserRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/depot-creation"
          element={
            <ProtectedRoute>
              <DepotCreation />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
