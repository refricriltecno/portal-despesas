import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// IMPORTAÇÕES REAIS (Certifique-se que os nomes dos ficheiros na pasta 'pages' estão corretos)
import Dashboard from './pages/Dashboard';
import Contratos from './pages/Contratos';
import Faturas from './pages/Faturas';

// PÁGINAS QUE AINDA VAMOS CRIAR (Temporárias)
const Historico = () => <div className="p-8"><h1 className="text-3xl font-bold">Histórico</h1><p>Logs de auditoria em breve.</p></div>;
const Admin = () => <div className="p-8"><h1 className="text-3xl font-bold">Admin</h1><p>Gestão de utilizadores em breve.</p></div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Agora a página inicial é o seu Dashboard real */}
          <Route index element={<Dashboard />} />
          
          <Route path="contratos" element={<Contratos />} />
          <Route path="faturas" element={<Faturas />} />
          <Route path="historico" element={<Historico />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}