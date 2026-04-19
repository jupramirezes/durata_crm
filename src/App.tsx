import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { supabase, isSupabaseReady } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import GlobalSearch from './components/GlobalSearch'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Empresas from './pages/Empresas'
import EmpresaDetalle from './pages/EmpresaDetalle'
import OportunidadDetalle from './pages/OportunidadDetalle'
import ConfiguradorMesa from './pages/ConfiguradorMesa'
import ConfiguradorGenerico from './pages/ConfiguradorGenerico'
import Cotizaciones from './pages/Cotizaciones'
import CotizacionEditor from './pages/CotizacionEditor'
import Precios from './pages/Precios'
import PreciosImportar from './pages/PreciosImportar'
import Configuracion from './pages/Configuracion'
// Lazy-load the spreadsheet prototype so Univer (~3MB) is only fetched when used
const SpreadsheetPrototype = lazy(() => import('./pages/SpreadsheetPrototype'))
import { ToastProvider } from './components/Toast'

function Layout({ children, user }: { children: React.ReactNode; user: User }) {
  return (
    <div className="app-shell">
      <Sidebar user={user} />
      <div className="app-main">
        <Topbar />
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>
      <GlobalSearch />
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseReady) {
      // No Supabase → skip auth (dev mode)
      setLoading(false)
      return
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        window.history.replaceState({}, '', '/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-baseline justify-center mb-2 gap-1.5">
            <span className="text-2xl font-extrabold text-[var(--color-text)]">Durata</span>
            <span className="text-2xl font-extrabold text-[var(--color-primary)]">CRM</span>
          </div>
          <p className="text-xs text-[var(--color-text-label)] font-mono">Cargando…</p>
        </div>
      </div>
    )
  }

  // If Supabase is ready but no user → show login
  if (isSupabaseReady && !user) {
    return <Login />
  }

  // Authenticated (or Supabase not configured → dev mode)
  return (
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
          <Layout user={user!}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/empresas/:id" element={<EmpresaDetalle />} />
              <Route path="/oportunidades/:id" element={<OportunidadDetalle />} />
              <Route path="/oportunidades/:id/configurar" element={<ConfiguradorMesa />} />
              <Route path="/oportunidades/:id/configurar-producto/:productoId" element={<ConfiguradorGenerico />} />
              <Route path="/cotizaciones" element={<Cotizaciones />} />
              <Route path="/cotizaciones/:id/editar" element={<CotizacionEditor />} />
              <Route path="/precios" element={<Precios />} />
              <Route path="/precios/importar" element={<PreciosImportar />} />
              <Route path="/config" element={<Configuracion />} />
              {/* Prototipo experimental: cotizador con spreadsheet embebido (lazy-loaded) */}
              <Route
                path="/oportunidades/:id/spreadsheet/:productoId"
                element={
                  <Suspense fallback={<div className="p-6 text-center text-[var(--color-text-label)]">Cargando spreadsheet...</div>}>
                    <SpreadsheetPrototype />
                  </Suspense>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </StoreProvider>
    </ToastProvider>
  )
}
