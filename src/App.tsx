import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Empresas from './pages/Empresas'
import EmpresaDetalle from './pages/EmpresaDetalle'
import OportunidadDetalle from './pages/OportunidadDetalle'
import ConfiguradorMesa from './pages/ConfiguradorMesa'
import Cotizaciones from './pages/Cotizaciones'
import CotizacionEditor from './pages/CotizacionEditor'
import Precios from './pages/Precios'
import Configuracion from './pages/Configuracion'

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
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/empresas/:id" element={<EmpresaDetalle />} />
            <Route path="/oportunidades/:id" element={<OportunidadDetalle />} />
            <Route path="/oportunidades/:id/configurar" element={<ConfiguradorMesa />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/cotizaciones/:id/editar" element={<CotizacionEditor />} />
            <Route path="/precios" element={<Precios />} />
            <Route path="/config" element={<Configuracion />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  )
}
