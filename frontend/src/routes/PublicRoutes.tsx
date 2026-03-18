// src/routes/PublicRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import MainLayout from "@/components/Layout/MainLayout"
import AuthLayout from "@/components/Layout/AuthLayout"
import ProtectedRoute from "@/auth/ProtectedRoute"

import Home from "@/pages/home"
import { ExploreDepots, DepotDetail } from "@/pages/depots"
import { Annonces } from "@/pages/annonces"
import { Connexion, Inscription, VerifyEmail } from "@/pages/auth"
import { APropos, ExecutiveBoard, Contributeurs } from "@/pages/a-propos"
import { InterfaceSelection } from "@/pages/common"
import AnnouncementDetail from "@/pages/annonces/AnnouncementDetail"
import { Articles, ArticleDetail } from "@/pages/articles"

export default function PublicRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  return (
    <Routes>
      {/* ── Auth pages (no header/footer) ── */}
      <Route element={<AuthLayout />}>
        <Route
          path="/connexion"
          element={isAuthenticated ? <Navigate to="/depots" replace /> : <Connexion />}
        />
        <Route
          path="/inscription"
          element={isAuthenticated ? <Navigate to="/depots" replace /> : <Inscription />}
        />
      </Route>

      {/* ── Public pages (with header/footer) ── */}
      <Route element={<MainLayout />}>

        {/* Landing — accessible to everyone */}
        <Route path="/" element={<Home />} />

        {/* Listing pages — public */}
        <Route path="/depots"   element={<ExploreDepots />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/annonces" element={<Annonces />} />

        {/* Detail pages — require authentication */}
        <Route
          path="/depots/:id"
          element={
            <ProtectedRoute>
              <DepotDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <ProtectedRoute>
              <ArticleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/annonces/:id"
          element={
            <ProtectedRoute>
              <AnnouncementDetail />
            </ProtectedRoute>
          }
        />

        {/* Other public routes */}
        <Route path="/verify-email"               element={<VerifyEmail />} />
        <Route path="/interface-selection"        element={<InterfaceSelection />} />
        <Route path="/a-propos"                   element={<APropos />} />
        <Route path="/a-propos/bureau-executif"   element={<ExecutiveBoard />} />
        <Route path="/a-propos/contributeurs"     element={<Contributeurs />} />

      </Route>
    </Routes>
  )
}
