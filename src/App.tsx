import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Clientes from './pages/Clientes'
import ClienteDetalle from './pages/ClienteDetalle'
import ConfiguradorMesa from './pages/ConfiguradorMesa'
import Cotizaciones from './pages/Cotizaciones'
import Precios from './pages/Precios'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<ClienteDetalle />} />
            <Route path="/clientes/:id/configurar" element={<ConfiguradorMesa />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/precios" element={<Precios />} />
            <Route path="/config" element={<div className="p-8"><h2 className="text-2xl font-bold mb-4">Configuración</h2><p className="text-[var(--color-text-muted)]">Módulo en construcción. Aquí irán: datos de la empresa, usuarios, integraciones.</p></div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  )
}
