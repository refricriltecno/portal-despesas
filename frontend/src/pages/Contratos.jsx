import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Contratos() {
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [contratos, setContratos] = useState([]);

  // Estados do Form
  const formInicial = {
    nomeAmigavel: '', filial: '', tipo: '', centroCusto: '',
    valorTotal: '', duracao: '', dataInicio: '', diaVencimento: '',
    fornecedor1: '', cnpj1: '', circ1: '', tags: '', info: ''
  };
  const [formData, setFormData] = useState(formInicial);
  const [temFornecedor2, setTemFornecedor2] = useState(false);
  const [fornecedor2, setFornecedor2] = useState({ razao: '', cnpj: '', circ: '' });
  const [isRateado, setIsRateado] = useState(false);

  const filiais = ["01 - Matriz", "08 - Porto Alegre", "09 - Floripa", "10 - São Paulo"];
  const centrosDeCusto = ["TI - Infraestrutura", "TI - Sistemas", "Administrativo", "Logística"];

  // Função para carregar dados (Usando useCallback para evitar erro de render do linter)
  const carregarDados = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contratos`);
      setContratos(res.data);
    } catch {
      console.error("Erro ao carregar");
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const calcularValorMensal = () => {
    const total = parseFloat(formData.valorTotal?.toString().replace(',', '.') || 0);
    const meses = parseInt(formData.duracao || 0);
    return meses > 0 ? (total / meses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      valorMensal: calcularValorMensal(),
      fornecedor2: temFornecedor2 ? fornecedor2 : null,
      isRateado,
      status: "Ativo"
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/api/contratos/${editId}`, payload);
      } else {
        await axios.post(`${API_URL}/api/contratos`, payload);
      }
      resetForm();
      carregarDados();
    } catch {
      alert("Erro ao salvar");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Excluir?")) {
      await axios.delete(`${API_URL}/api/contratos/${id}`);
      carregarDados();
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditId(null);
    setFormData(formInicial);
    setTemFornecedor2(false);
    setIsRateado(false);
  };

  if (!isCreating) {
    return (
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Contratos</h2>
          <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded">+ Novo</button>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Filial</th>
                <th className="p-4">Valor Mensal</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-4 font-medium">{c.nomeAmigavel}</td>
                  <td className="p-4">{c.filial}</td>
                  <td className="p-4 text-blue-600 font-bold">{c.valorMensal}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-6">{editId ? 'Editar' : 'Novo'} Contrato</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="nomeAmigavel" placeholder="Nome Amigável" value={formData.nomeAmigavel} onChange={handleChange} className="border p-2 rounded" required />
          <select name="filial" value={formData.filial} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Selecione Filial</option>
            {filiais.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select name="centroCusto" value={formData.centroCusto} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Centro de Custo</option>
            {centrosDeCusto.map(cc => <option key={cc} value={cc}>{cc}</option>)}
          </select>
          <input type="text" name="fornecedor1" placeholder="Razão Social Fornecedor" value={formData.fornecedor1} onChange={handleChange} className="border p-2 rounded" required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="number" name="valorTotal" placeholder="Valor Total" value={formData.valorTotal} onChange={handleChange} className="border p-2 rounded" required />
          <input type="number" name="duracao" placeholder="Meses" value={formData.duracao} onChange={handleChange} className="border p-2 rounded" required />
          <div className="p-2 bg-blue-50 text-blue-800 font-bold rounded">{calcularValorMensal()}</div>
        </div>

        {/* Checkbox para Fornecedor 2 (Usa a variável setTemFornecedor2 para o Lint não reclamar) */}
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={temFornecedor2} onChange={(e) => setTemFornecedor2(e.target.checked)} />
          <span>Tem fornecedor 2?</span>
        </label>

        {temFornecedor2 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
            <input type="text" placeholder="Razão Fornecedor 2" onChange={(e) => setFornecedor2({...fornecedor2, razao: e.target.value})} className="border p-2 rounded" />
            <input type="text" placeholder="CNPJ 2" onChange={(e) => setFornecedor2({...fornecedor2, cnpj: e.target.value})} className="border p-2 rounded" />
          </div>
        )}

        {/* Checkbox para Rateio */}
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isRateado} onChange={(e) => setIsRateado(e.target.checked)} />
          <span>Contrato rateado?</span>
        </label>

        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={resetForm} className="text-gray-600">Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Salvar no MongoDB</button>
        </div>
      </form>
    </div>
  );
}