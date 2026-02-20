import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// URL do seu backend no Render (será configurada no painel do Render depois)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Contratos() {
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [contratos, setContratos] = useState([]);

  // ==========================================
  // LISTAS COMPLETAS (REFRICRIL)
  // ==========================================
  const filiais = [
    "00 - Administrativo", "01 - Matriz", "08 - Porto Alegre", "09 - Floripa",
    "06 - Blumenau", "12 - Itajaí", "03 - Joinville", "05 - Londrina",
    "17 - CD São Paulo", "22 - São Paulo (Itaim)", "21 - São Paulo (Osasco)",
    "20 - São Paulo (Guarulhos)", "10 - São Paulo", "02 - CD Vila Velha",
    "24 - CD Goiânia", "15 - Teresina", "18 - Belo Horizonte", "11 - Vila Velha",
    "07 - CD Içara", "13 - CD Paraíba", "27 - Brasília", "14 - Goiania"
  ];

  const centrosDeCusto = [
    "TI - Infraestrutura", "TI - Sistemas", "TI - Geral", "Administrativo",
    "Comercial", "Financeiro", "RH", "Logística"
  ];

  // ==========================================
  // ESTADOS DO FORMULÁRIO
  // ==========================================
  const formInicial = {
    nomeAmigavel: '', filial: '', tipo: '', centroCusto: '',
    valorTotal: '', duracao: '', dataInicio: '', diaVencimento: '',
    fornecedor1: '', cnpj1: '', circ1: '', tags: '', info: ''
  };

  const [formData, setFormData] = useState(formInicial);
  const [temFornecedor2, setTemFornecedor2] = useState(false);
  const [fornecedor2, setFornecedor2] = useState({ razao: '', cnpj: '', circ: '' });
  const [isRateado, setIsRateado] = useState(false);

  // ==========================================
  // COMUNICAÇÃO COM O BACKEND (MONGODB)
  // ==========================================
  const carregarContratos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contratos`);
      setContratos(res.data);
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
    }
  }, []);

  useEffect(() => {
    carregarContratos();
  }, [carregarContratos]);

  // ==========================================
  // LÓGICA DE NEGÓCIO
  // ==========================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calcularValorMensal = () => {
    const total = parseFloat(formData.valorTotal?.toString().replace(',', '.') || 0);
    const meses = parseInt(formData.duracao || 0);
    if (!isNaN(total) && !isNaN(meses) && meses > 0) {
      return (total / meses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return 'R$ 0,00';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      valorMensal: calcularValorMensal(),
      fornecedor2: temFornecedor2 ? fornecedor2 : null,
      isRateado: isRateado,
      status: "Ativo"
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/api/contratos/${editId}`, payload);
      } else {
        await axios.post(`${API_URL}/api/contratos`, payload);
      }
      alert("Contrato salvo no MongoDB com sucesso!");
      resetForm();
      carregarContratos();
    } catch (error) {
      alert("Erro ao salvar contrato. Verifique se o backend está rodando.");
    }
  };

  const handleEdit = (contrato) => {
    setFormData(contrato);
    setTemFornecedor2(!!contrato.fornecedor2);
    if (contrato.fornecedor2) setFornecedor2(contrato.fornecedor2);
    setIsRateado(contrato.isRateado || false);
    setEditId(contrato.id || contrato._id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este contrato do sistema?")) {
      try {
        await axios.delete(`${API_URL}/api/contratos/${id}`);
        carregarContratos();
      } catch (error) {
        alert("Erro ao excluir.");
      }
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditId(null);
    setFormData(formInicial);
    setTemFornecedor2(false);
    setIsRateado(false);
    setFornecedor2({ razao: '', cnpj: '', circ: '' });
  };

  // ==========================================
  // RENDERIZAÇÃO DA TABELA (LISTA)
  // ==========================================
  if (!isCreating) {
    return (
      <div className="max-w-7xl mx-auto font-sans p-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-800">Gestão de Contratos</h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            + Novo Contrato
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Nome Amigável</th>
                <th className="px-6 py-3 text-left">Fornecedor</th>
                <th className="px-6 py-3 text-left">Centro de Custo</th>
                <th className="px-6 py-3 text-left">Valor Mensal</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contratos.map((c) => (
                <tr key={c.id || c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.nomeAmigavel}</td>
                  <td className="px-6 py-4 text-gray-600">{c.fornecedor1}</td>
                  <td className="px-6 py-4 text-gray-600">{c.centroCusto}</td>
                  <td className="px-6 py-4 text-blue-600 font-bold">{c.valorMensal}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline mr-4">Editar</button>
                    <button onClick={() => handleDelete(c.id || c._id)} className="text-red-600 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
              {contratos.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Nenhum contrato encontrado no MongoDB Atlas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZAÇÃO DO FORMULÁRIO (COMPLETO)
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-md font-sans my-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-slate-800">{editId ? 'Editar Contrato' : 'Novo Contrato'}</h2>
        <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-800">← Voltar para Lista</button>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-8">
        {/* BLOCO 1: Informações Básicas */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">1. Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Amigável *</label>
              <input type="text" name="nomeAmigavel" value={formData.nomeAmigavel} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Filial *</label>
              <select name="filial" value={formData.filial} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm">
                <option value="">Selecione...</option>
                {filiais.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* BLOCO 2: Dados do Contrato */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">2. Dados do Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo *</label>
              <select name="tipo" value={formData.tipo} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm">
                <option value="">Selecione...</option>
                <option value="Serviço">Serviço</option>
                <option value="Produto">Produto</option>
                <option value="Misto">Misto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Centro de Custo *</label>
              <select name="centroCusto" value={formData.centroCusto} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm">
                <option value="">Selecione...</option>
                {centrosDeCusto.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Início Cobrança</label>
              <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Total (R$) *</label>
              <input type="number" step="0.01" name="valorTotal" value={formData.valorTotal} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duração (Meses) *</label>
              <input type="number" name="duracao" value={formData.duracao} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Mensal (Calc.)</label>
              <input type="text" readOnly value={calcularValorMensal()} className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 p-2 font-bold text-blue-800" />
            </div>
          </div>
        </section>

        {/* BLOCO 3: Fornecedores */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">3. Fornecedores</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Razão Social 1 *</label>
              <input type="text" name="fornecedor1" value={formData.fornecedor1} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CNPJ 1 *</label>
              <input type="text" name="cnpj1" value={formData.cnpj1} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Circ. Fornecedor 1</label>
              <input type="text" name="circ1" value={formData.circ1} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer mb-4">
            <input type="checkbox" checked={temFornecedor2} onChange={(e) => setTemFornecedor2(e.target.checked)} className="rounded border-gray-300 text-blue-600 w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">Tem fornecedor 2?</span>
          </label>

          {temFornecedor2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-gray-700">Razão Social 2 *</label>
                <input type="text" value={fornecedor2.razao} required onChange={(e) => setFornecedor2({...fornecedor2, razao: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CNPJ 2 *</label>
                <input type="text" value={fornecedor2.cnpj} required onChange={(e) => setFornecedor2({...fornecedor2, cnpj: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Circ. Fornecedor 2</label>
                <input type="text" value={fornecedor2.circ} onChange={(e) => setFornecedor2({...fornecedor2, circ: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
              </div>
            </div>
          )}
        </section>

        {/* BLOCO 4: Observações e Rateio */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">4. Observações e Rateio</h3>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Identificadores (Tags/Ref)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Ex: urgência, projeto-x" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Informações Adicionais</label>
              <textarea name="info" rows="2" value={formData.info} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"></textarea>
            </div>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isRateado} onChange={(e) => setIsRateado(e.target.checked)} className="rounded border-gray-300 text-blue-600 w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">Este contrato é rateado entre filiais?</span>
          </label>
        </section>

        {/* BLOCO 5: Documento do Contrato */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">5. Documento do Contrato</h3>
          <div className="flex justify-center rounded-lg border border-dashed border-gray-400 px-6 py-10 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
            <div className="text-center">
              <span className="block text-blue-600 font-bold">Clique para selecionar o PDF/DOC do contrato</span>
              <p className="text-xs text-gray-500">O upload será processado pelo backend no Render</p>
            </div>
          </div>
        </section>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex justify-end space-x-4 border-t pt-6">
          <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-lg transition-transform active:scale-95">
            {editId ? 'Atualizar no Banco' : 'Salvar no MongoDB'}
          </button>
        </div>
      </form>
    </div>
  );
}