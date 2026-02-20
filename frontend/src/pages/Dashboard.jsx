import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://portal-despesas.onrender.com';

export default function Dashboard() {
  const [metricas, setMetricas] = useState({ totalContratos: 0, gastoMensal: 0 });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/contratos`);
        const lista = res.data;
        
        const soma = lista.reduce((acc, c) => {
          const valor = parseFloat(c.valorMensal.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
          return acc + valor;
        }, 0);

        setMetricas({
          totalContratos: lista.length,
          gastoMensal: soma
        });
      } catch (err) {
        console.error("Erro ao buscar dados reais");
      }
    };
    buscarDados();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Dashboard Real - Refricril</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border-l-8 border-blue-600">
          <p className="text-gray-500">Contratos no Banco de Dados</p>
          <p className="text-4xl font-bold">{metricas.totalContratos}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-8 border-green-600">
          <p className="text-gray-500">Gasto Mensal Total</p>
          <p className="text-4xl font-bold">
            {metricas.gastoMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
    </div>
  );
}