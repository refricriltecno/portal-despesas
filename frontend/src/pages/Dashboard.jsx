import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    totalContratos: 0,
    gastoMensalContratos: 0,
    totalFaturas: 0,
    faturasPendentes: 0,
  });

  const [faturasRecentes, setFaturasRecentes] = useState([]);

  useEffect(() => {
    // 1. Vai buscar os dados guardados na memória das outras abas
    const contratosSalvos = JSON.parse(localStorage.getItem('contratos_teste')) || [];
    const faturasSalvas = JSON.parse(localStorage.getItem('faturas_teste')) || [];

    // 2. Calcula as métricas dos Contratos
    const contratosAtivos = contratosSalvos.filter(c => c.status === 'Ativo');
    
    // Soma os valores dos contratos (limpando a formatação 'R$ 1.500,00' para número)
    const somaContratos = contratosAtivos.reduce((acc, c) => {
      const valorLimpo = c.valorMensal ? parseFloat(c.valorMensal.replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0;
      return acc + valorLimpo;
    }, 0);

    // 3. Calcula as métricas das Faturas
    const somaFaturas = faturasSalvas.reduce((acc, f) => {
      const valorLimpo = f.totalCalculado ? parseFloat(f.totalCalculado.replace('R$', '').replace(/\./g, '').replace(',', '.')) : 0;
      return acc + valorLimpo;
    }, 0);

    // Pega as últimas 5 faturas pendentes para a tabela de Alertas
    const pendentes = faturasSalvas.filter(f => f.status === 'Pendente').slice(0, 5);

    // 4. Atualiza a tela com a matemática feita
    setMetricas({
      totalContratos: contratosAtivos.length,
      gastoMensalContratos: somaContratos,
      totalFaturas: faturasSalvas.length,
      faturasPendentes: somaFaturas, // Assumindo que tudo recém lançado está pendente
    });

    setFaturasRecentes(pendentes);
  }, []);

  // Função para formatar números para Moeda (Real)
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="max-w-7xl mx-auto font-sans">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Visão Geral Financeira</h2>

      {/* BLOCO 1: CARDS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Contratos Ativos</p>
            <p className="text-2xl font-bold text-slate-800">{metricas.totalContratos}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Previsão Mensal (Contratos)</p>
            <p className="text-2xl font-bold text-slate-800">{formatarMoeda(metricas.gastoMensalContratos)}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Qtd. Faturas (Mês)</p>
            <p className="text-2xl font-bold text-slate-800">{metricas.totalFaturas}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Faturas Pendentes (R$)</p>
            <p className="text-2xl font-bold text-red-600">{formatarMoeda(metricas.faturasPendentes)}</p>
          </div>
        </div>

      </div>

      {/* BLOCO 2: CONTEÚDO DIVIDIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gráfico Simulado de Centro de Custo */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição por Centro de Custo (Simulação)</h3>
          <div className="space-y-4">
            
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-gray-700">TI - Sistemas</span>
                <span className="text-blue-600">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-gray-700">TI - Infraestrutura</span>
                <span className="text-indigo-600">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-gray-700">Administrativo</span>
                <span className="text-green-600">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

          </div>
          <p className="text-xs text-gray-400 mt-6 italic">* Gráficos dinâmicos com Recharts serão ativados com a integração do Backend.</p>
        </div>

        {/* Faturas a Vencer (Ações Rápidas) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Próximos Vencimentos</h3>
          
          <div className="space-y-4">
            {faturasRecentes.length > 0 ? (
              faturasRecentes.map(f => (
                <div key={f.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{f.nomeContrato}</p>
                    <p className="text-xs text-gray-600">Vence: {f.vencimento ? new Date(f.vencimento + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">{f.totalCalculado}</span>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
                Nenhuma fatura pendente ou cadastrada.
              </div>
            )}
          </div>
          
          <button className="w-full mt-6 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200">
            Ver todas as faturas →
          </button>
        </div>

      </div>
    </div>
  );
}