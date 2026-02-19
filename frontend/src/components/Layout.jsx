import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  const abas = [
    { nome: 'Dashboard', rota: '/' },
    { nome: 'Contratos', rota: '/contratos' },
    { nome: 'Faturas', rota: '/faturas' },
    { nome: 'Histórico', rota: '/historico' },
    { nome: 'Admin', rota: '/admin' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-center text-blue-400">
          Portal de TI
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {abas.map((aba) => (
            <NavLink
              key={aba.nome}
              to={aba.rota}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {aba.nome}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Área Principal onde o conteúdo das páginas aparece */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}