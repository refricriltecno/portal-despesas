import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileDown, Receipt, FileText } from 'lucide-react'; // Importação dos ícones

// URL do seu backend no Render (ou localhost em desenvolvimento)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Faturas() {
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState(null);

  // ==========================================
  // INTEGRAÇÃO COM CONTRATOS (Lê da API/MongoDB)
  // ==========================================
  const [contratos, setContratos] = useState([]);
  
  useEffect(() => {
    const carregarContratos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/contratos`);
        setContratos(res.data);
      } catch (error) {
        console.error("Erro ao carregar contratos na tela de faturas:", error);
      }
    };
    carregarContratos();
  }, []);

  // ==========================================
  // MEMÓRIA DAS FATURAS
  // ==========================================
  const [faturas, setFaturas] = useState(() => {
    const faturasSalvas = localStorage.getItem('faturas_teste');
    if (faturasSalvas) {
      return JSON.parse(faturasSalvas);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('faturas_teste', JSON.stringify(faturas));
  }, [faturas]);

  // ==========================================
  // ESTADOS DO FORMULÁRIO E ARQUIVOS
  // ==========================================
  const formInicial = {
    contratoId: '',
    mesReferencia: '2026-02', 
    vencimento: '',
    circuito: '',
    valorOriginal: '',
    descontos: '',
    acrescimos: '',
    observacoes: ''
  };
  const [formData, setFormData] = useState(formInicial);
  
  // Estados para capturar os arquivos físicos no futuro
  const [arquivoBoleto, setArquivoBoleto] = useState(null);
  const [arquivoNf, setArquivoNf] = useState(null);

  // ==========================================
  // FUNÇÕES DE LÓGICA, CÁLCULO E DIVERGÊNCIA
  // ==========================================
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const calcularTotalPagar = () => {
    const original = parseFloat(formData.valorOriginal?.toString().replace(',', '.') || 0);
    const descontos = parseFloat(formData.descontos?.toString().replace(',', '.') || 0);
    const acrescimos = parseFloat(formData.acrescimos?.toString().replace(',', '.') || 0);
    
    const total = original - descontos + acrescimos;
    
    if (!isNaN(total)) {
      return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return 'R$ 0,00';
  };

  const parseCurrency = (val) => {
    if (!val) return 0;
    return parseFloat(String(val).replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
  };

  const checarDivergencia = (fatura, contrato) => {
    if (!contrato) return false;
    const valFatura = parseCurrency(fatura.totalCalculado);
    const valContrato = parseCurrency(contrato.valorMensal);
    return Math.abs(valFatura - valContrato) > 0.01;
  };

  // ==========================================
  // AÇÕES DO CRUD
  // ==========================================
  const onSubmit = (e) => {
    e.preventDefault();
    
    const contratoSelecionado = contratos.find(c => (c.id || c._id).toString() === formData.contratoId.toString());
    const nomeContrato = contratoSelecionado ? contratoSelecionado.nomeAmigavel : "Desconhecido";

    const payload = {
      ...formData,
      nomeContrato: nomeContrato,
      totalCalculado: calcularTotalPagar(),
      status: "Pendente",
      // Simulando nomes de arquivo. Futuramente virão do Backend.
      caminho_arquivo: arquivoBoleto ? `uploads/${arquivoBoleto.name}` : null,
      caminho_nf: arquivoNf ? `uploads/${arquivoNf.name}` : null
    };

    if (editId) {
      setFaturas(faturas.map(f => f.id === editId ? { ...f, ...payload } : f));
      alert("Fatura atualizada com sucesso!");
    } else {
      payload.id = crypto.randomUUID();
      setFaturas([...faturas, payload]);
      alert("Nova fatura lançada com sucesso!");
    }

    resetForm();
  };

  const handleEdit = (fatura) => {
    setFormData(fatura);
    setEditId(fatura.id);
    setIsCreating(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem a certeza que deseja excluir esta fatura?")) {
      setFaturas(faturas.filter(f => f.id !== id));
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditId(null);
    setFormData(formInicial);
    setArquivoBoleto(null);
    setArquivoNf(null);
  };

  // ==========================================
  // TELA 1: LISTAGEM DE FATURAS (TABELA)
  // ==========================================
  if (!isCreating) {
    return (
      <div className="max-w-7xl mx-auto font-sans p-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-slate-800">Lançamento de Faturas</h2>
          <button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
            + Nova Fatura
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contrato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês Ref.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total a Pagar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documentos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faturas.map((f) => {
                const contrato = contratos.find(c => (c.id || c._id).toString() === f.contratoId.toString());
                const divergente = checarDivergencia(f, contrato);
                const valorEsperado = contrato ? contrato.valorMensal : 'R$ 0,00';

                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{f.nomeContrato}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{f.mesReferencia}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {f.vencimento ? new Date(f.vencimento + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-bold ${divergente ? 'text-red-600' : 'text-green-600'}`}>
                        {f.totalCalculado}
                      </div>
                      {divergente && (
                        <div className="text-[11px] text-red-500 font-medium mt-1 bg-red-50 px-2 py-1 rounded inline-block">
                          Contrato: {valorEsperado}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        {/* Download Boleto */}
                        <a href={f.caminho_arquivo ? `${API_URL}/${f.caminho_arquivo}` : '#'} target={f.caminho_arquivo ? "_blank" : "_self"} onClick={(e) => !f.caminho_arquivo && e.preventDefault()} className={`flex items-center gap-1 text-sm font-semibold transition-colors ${f.caminho_arquivo ? 'text-blue-600 hover:text-blue-800' : 'text-gray-300 cursor-not-allowed'}`} title="Baixar Boleto">
                          <FileDown size={18} /> Boleto
                        </a>

                        {/* Download NF */}
                        <a href={f.caminho_nf ? `${API_URL}/${f.caminho_nf}` : '#'} target={f.caminho_nf ? "_blank" : "_self"} onClick={(e) => !f.caminho_nf && e.preventDefault()} className={`flex items-center gap-1 text-sm font-semibold transition-colors ${f.caminho_nf ? 'text-emerald-600 hover:text-emerald-800' : 'text-gray-300 cursor-not-allowed'}`} title="Baixar Nota Fiscal">
                          <Receipt size={18} /> NF
                        </a>

                        {/* Download Contrato */}
                        <a href={contrato?.caminho_arquivo ? `${API_URL}/${contrato.caminho_arquivo}` : '#'} target={contrato?.caminho_arquivo ? "_blank" : "_self"} onClick={(e) => !contrato?.caminho_arquivo && e.preventDefault()} className={`flex items-center gap-1 text-sm font-semibold transition-colors ${contrato?.caminho_arquivo ? 'text-purple-600 hover:text-purple-800' : 'text-gray-300 cursor-not-allowed'}`} title="Baixar Contrato Original">
                          <FileText size={18} /> Contrato
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(f)} className="text-blue-600 hover:text-blue-900 mr-4 font-semibold">Editar</button>
                      <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-900 font-semibold">Excluir</button>
                    </td>
                  </tr>
                );
              })}
              {faturas.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Nenhuma fatura lançada. Clique em "+ Nova Fatura" para começar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 2: FORMULÁRIO
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-md font-sans my-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-slate-800">{editId ? 'Editar Fatura' : 'Nova Fatura'}</h2>
        <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-800 font-medium">← Voltar para Lista</button>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-8">
        
        {/* BLOCO 1: Geral */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">1. Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contrato *</label>
              <select name="contratoId" value={formData.contratoId} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500">
                <option value="">Selecione um contrato...</option>
                {contratos.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.nomeAmigavel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mês Referência *</label>
              <input type="month" name="mesReferencia" value={formData.mesReferencia} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vencimento *</label>
              <input type="date" name="vencimento" value={formData.vencimento} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Circuito</label>
              <input type="text" name="circuito" value={formData.circuito} onChange={handleChange} placeholder="Ex: L123456" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
            </div>
          </div>
        </section>

        {/* BLOCO 2: Valores */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">2. Valores</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Original (Boleto) *</label>
              <input type="number" step="0.01" name="valorOriginal" value={formData.valorOriginal} required onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descontos (-)</label>
              <input type="number" step="0.01" name="descontos" value={formData.descontos} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 text-green-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Acréscimos (+)</label>
              <input type="number" step="0.01" name="acrescimos" value={formData.acrescimos} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 text-red-600" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900">Total a Pagar</label>
              <input type="text" readOnly value={calcularTotalPagar()} className="mt-1 block w-full rounded-md border-2 border-blue-400 bg-blue-50 p-2 shadow-sm text-blue-800 font-bold text-lg cursor-not-allowed" />
            </div>
          </div>
        </section>

        {/* BLOCO 3: Observações */}
        <section>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea name="observacoes" rows="2" value={formData.observacoes} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500"></textarea>
          </div>
        </section>

        {/* BLOCO 4: Arquivos */}
        <section>
          <h3 className="text-xl font-semibold text-blue-600 mb-4 border-l-4 border-blue-600 pl-2">3. Arquivos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer ${arquivoBoleto ? 'border-blue-500 bg-blue-50' : 'border-gray-400'}`}>
              <label className="cursor-pointer block">
                <span className={`block font-bold mb-1 ${arquivoBoleto ? 'text-blue-700' : 'text-blue-600'}`}>
                  {arquivoBoleto ? '✅ Boleto Anexado' : 'Boleto Bancário (PDF) *'}
                </span>
                <span className="text-sm text-gray-500">{arquivoBoleto ? arquivoBoleto.name : 'Clique para anexar o boleto'}</span>
                <input type="file" required={!editId} accept=".pdf" className="sr-only" onChange={(e) => setArquivoBoleto(e.target.files[0])} />
              </label>
            </div>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer ${arquivoNf ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
              <label className="cursor-pointer block">
                <span className={`block font-bold mb-1 ${arquivoNf ? 'text-green-700' : 'text-gray-700'}`}>
                  {arquivoNf ? '✅ NF Anexada' : 'Nota Fiscal (Opcional)'}
                </span>
                <span className="text-sm text-gray-500">{arquivoNf ? arquivoNf.name : 'Clique para anexar a NF (.pdf, .xml)'}</span>
                <input type="file" accept=".pdf,.xml" className="sr-only" onChange={(e) => setArquivoNf(e.target.files[0])} />
              </label>
            </div>
          </div>
        </section>

        {/* BOTÕES */}
        <div className="flex justify-end space-x-4 border-t pt-6">
          <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 font-bold shadow-lg transition-transform active:scale-95">
            {editId ? 'Atualizar Fatura' : 'Lançar Fatura'}
          </button>
        </div>
      </form>
    </div>
  );
}