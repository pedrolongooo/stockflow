// ── ESTADO ────────────────────────────────────────────
let produtos = JSON.parse(localStorage.getItem('estoque') || '[]');
let nextId   = parseInt(localStorage.getItem('nextId') || '1');
let editandoId = null;

// ── STORAGE ───────────────────────────────────────────
function salvarStorage() {
  localStorage.setItem('estoque', JSON.stringify(produtos));
  localStorage.setItem('nextId', String(nextId));
}

// ── SKU ───────────────────────────────────────────────
function gerarSKU(categoria, id) {
  const prefixos = {
    eletronicos: 'ELE',
    alimentacao: 'ALI',
    vestuario:   'VES',
    ferramentas: 'FER',
    outros:      'OUT'
  };
  const prefixo = prefixos[categoria] || 'PRD';
  return prefixo + String(id).padStart(4, '0');
}

// ── VALIDAÇÃO ─────────────────────────────────────────
function validarProduto(nome, qtd, preco) {
  if (!nome || nome.trim() === '')    return 'Nome do produto é obrigatório.';
  if (isNaN(qtd)  || qtd < 0)        return 'Quantidade inválida.';
  if (isNaN(preco) || preco < 0)     return 'Preço inválido.';
  return null;
}

// ── CRIAR ─────────────────────────────────────────────
function criarProduto(nome, categoria, qtd, preco) {
  const erro = validarProduto(nome, qtd, preco);
  if (erro) return { sucesso: false, mensagem: erro };

  const produto = {
    id: nextId++,
    nome: nome.trim(),
    categoria,
    qtd,
    preco,
    sku: gerarSKU(categoria, nextId - 1)
  };

  produtos.push(produto);
  salvarStorage();
  return { sucesso: true, produto };
}

// ── ATUALIZAR ─────────────────────────────────────────
function atualizarProduto(id, nome, categoria, qtd, preco) {
  const erro = validarProduto(nome, qtd, preco);
  if (erro) return { sucesso: false, mensagem: erro };

  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) return { sucesso: false, mensagem: 'Produto não encontrado.' };

  produtos[idx] = {
    ...produtos[idx],
    nome: nome.trim(),
    categoria,
    qtd,
    preco,
    sku: gerarSKU(categoria, id)
  };

  salvarStorage();
  return { sucesso: true, produto: produtos[idx] };
}

// ── DELETAR ───────────────────────────────────────────
function deletarProduto(id) {
  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) return { sucesso: false, mensagem: 'Produto não encontrado.' };

  produtos.splice(idx, 1);
  salvarStorage();
  return { sucesso: true };
}

// ── BUSCAR ────────────────────────────────────────────
function buscarProdutos(termo, categoria) {
  return produtos.filter(p => {
    const matchNome = !termo || p.nome.toLowerCase().includes(termo.toLowerCase())
                             || p.sku.toLowerCase().includes(termo.toLowerCase());
    const matchCat  = !categoria || p.categoria === categoria;
    return matchNome && matchCat;
  });
}

// ── STATS ─────────────────────────────────────────────
function calcularStats() {
  return {
    total:        produtos.length,
    estoqueBaixo: produtos.filter(p => p.qtd <= 5).length,
    valorTotal:   produtos.reduce((s, p) => s + p.qtd * p.preco, 0)
  };
}

// ── HELPERS ───────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const catLabels = {
  eletronicos: 'Eletrônicos',
  alimentacao: 'Alimentação',
  vestuario:   'Vestuário',
  ferramentas: 'Ferramentas',
  outros:      'Outros'
};

// ── RENDER TABELA ─────────────────────────────────────
function renderTabela() {
  const termo     = document.getElementById('search').value;
  const catFilt   = document.getElementById('filtro-cat').value;
  const filtrados = buscarProdutos(termo, catFilt);

  const tbody = document.getElementById('tabela-body');
  const empty = document.getElementById('empty-state');

  if (filtrados.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = filtrados.map(p => {
      const valorTotal = (p.qtd * p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const precoFmt   = p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const qtyClass   = p.qtd <= 5 ? 'qty-low' : 'qty-ok';
      const label      = catLabels[p.categoria] || p.categoria;
      return `
        <tr>
          <td>
            <div class="product-name">${escHtml(p.nome)}</div>
            <div class="product-sku">${escHtml(p.sku)}</div>
          </td>
          <td><span class="badge badge-${p.categoria}">${label}</span></td>
          <td><span class="qty ${qtyClass}">${p.qtd}${p.qtd <= 5 ? ' ⚠️' : ''}</span></td>
          <td><span class="price">${precoFmt}</span></td>
          <td><span class="price">${valorTotal}</span></td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-edit btn-sm" onclick="abrirEdicao(${p.id})">✏️ Editar</button>
              <button class="btn btn-danger btn-sm" onclick="confirmarDelecao(${p.id})">🗑️ Remover</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  atualizarStatsUI();
}

// ── STATS UI ──────────────────────────────────────────
function atualizarStatsUI() {
  const s = calcularStats();
  document.getElementById('stat-total').textContent = s.total;
  document.getElementById('stat-low').textContent   = s.estoqueBaixo;
  document.getElementById('stat-value').textContent =
    s.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── FORM ADD ──────────────────────────────────────────
function adicionarProduto() {
  const nome      = document.getElementById('inp-nome').value;
  const categoria = document.getElementById('inp-categoria').value;
  const qtd       = parseInt(document.getElementById('inp-qtd').value);
  const preco     = parseFloat(document.getElementById('inp-preco').value);

  const resultado = criarProduto(nome, categoria, qtd, preco);
  if (!resultado.sucesso) return toast(resultado.mensagem, true);

  limparForm();
  renderTabela();
  toast('Produto adicionado com sucesso!');
}

function limparForm() {
  document.getElementById('inp-nome').value      = '';
  document.getElementById('inp-qtd').value       = '';
  document.getElementById('inp-preco').value     = '';
  document.getElementById('inp-categoria').value = 'eletronicos';
}

// ── MODAL EDITAR ──────────────────────────────────────
function abrirEdicao(id) {
  const p = produtos.find(p => p.id === id);
  if (!p) return;
  editandoId = id;
  document.getElementById('edit-nome').value      = p.nome;
  document.getElementById('edit-categoria').value = p.categoria;
  document.getElementById('edit-qtd').value       = p.qtd;
  document.getElementById('edit-preco').value     = p.preco;
  document.getElementById('modal').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
  editandoId = null;
}

function salvarEdicao() {
  const nome      = document.getElementById('edit-nome').value;
  const categoria = document.getElementById('edit-categoria').value;
  const qtd       = parseInt(document.getElementById('edit-qtd').value);
  const preco     = parseFloat(document.getElementById('edit-preco').value);

  const resultado = atualizarProduto(editandoId, nome, categoria, qtd, preco);
  if (!resultado.sucesso) return toast(resultado.mensagem, true);

  fecharModal();
  renderTabela();
  toast('Produto atualizado!');
}

// ── DELETAR ───────────────────────────────────────────
function confirmarDelecao(id) {
  if (!confirm('Remover este produto do estoque?')) return;
  const resultado = deletarProduto(id);
  if (!resultado.sucesso) return toast(resultado.mensagem, true);
  renderTabela();
  toast('Produto removido.');
}

// ── TOAST ─────────────────────────────────────────────
let toastTimer;
function toast(msg, erro = false) {
  const el = document.getElementById('toast');
  el.textContent = (erro ? '⚠️ ' : '✅ ') + msg;
  el.className = 'show' + (erro ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}

// ── EXPORTS (para testes com Jest) ────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    gerarSKU,
    validarProduto,
    criarProduto,
    atualizarProduto,
    deletarProduto,
    buscarProdutos,
    calcularStats,
    escHtml
  };
}

// ── EVENTOS DOM (só executa no navegador, não no Jest) ─
if (typeof document !== 'undefined') {
  document.getElementById('btn-adicionar').addEventListener('click', adicionarProduto);
  document.getElementById('btn-limpar').addEventListener('click', limparForm);
  document.getElementById('btn-salvar-edicao').addEventListener('click', salvarEdicao);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);
  document.getElementById('search').addEventListener('input', renderTabela);
  document.getElementById('filtro-cat').addEventListener('change', renderTabela);
  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) fecharModal();
  });

  renderTabela();
}