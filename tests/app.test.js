
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (k)    => store[k] ?? null,
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: (k)    => { delete store[k]; },
    clear:      ()     => { store = {}; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

const {
  gerarSKU,
  validarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  buscarProdutos,
  calcularStats,
  escHtml
} = require('../js/app');

// Resetar estado entre testes
beforeEach(() => {
  localStorage.clear();
  // Limpa o array de produtos e o nextId
  const mod = require('../js/app');
  // Re-importar zerado
  jest.resetModules();
});

// ────────────────────────────────────────────────────
// gerarSKU
// ────────────────────────────────────────────────────
describe('gerarSKU()', () => {
  test('gera SKU correto para eletrônicos', () => {
    expect(gerarSKU('eletronicos', 1)).toBe('ELE0001');
  });

  test('gera SKU correto para alimentação', () => {
    expect(gerarSKU('alimentacao', 42)).toBe('ALI0042');
  });

  test('gera SKU correto para vestuário', () => {
    expect(gerarSKU('vestuario', 7)).toBe('VES0007');
  });

  test('gera SKU correto para ferramentas', () => {
    expect(gerarSKU('ferramentas', 100)).toBe('FER0100');
  });

  test('gera SKU com prefixo genérico para categoria desconhecida', () => {
    expect(gerarSKU('desconhecido', 5)).toBe('PRD0005');
  });

  test('preenche zeros à esquerda corretamente', () => {
    expect(gerarSKU('outros', 9999)).toBe('OUT9999');
  });
});

// ────────────────────────────────────────────────────
// validarProduto
// ────────────────────────────────────────────────────
describe('validarProduto()', () => {
  test('retorna null para dados válidos', () => {
    expect(validarProduto('Notebook', 10, 2500)).toBeNull();
  });

  test('retorna erro quando nome está vazio', () => {
    expect(validarProduto('', 10, 100)).toBe('Nome do produto é obrigatório.');
  });

  test('retorna erro quando nome é só espaços', () => {
    expect(validarProduto('   ', 10, 100)).toBe('Nome do produto é obrigatório.');
  });

  test('retorna erro quando quantidade é negativa', () => {
    expect(validarProduto('Produto', -1, 100)).toBe('Quantidade inválida.');
  });

  test('retorna erro quando quantidade não é número', () => {
    expect(validarProduto('Produto', NaN, 100)).toBe('Quantidade inválida.');
  });

  test('retorna erro quando preço é negativo', () => {
    expect(validarProduto('Produto', 10, -5)).toBe('Preço inválido.');
  });

  test('retorna erro quando preço não é número', () => {
    expect(validarProduto('Produto', 10, NaN)).toBe('Preço inválido.');
  });

  test('aceita quantidade zero', () => {
    expect(validarProduto('Produto', 0, 100)).toBeNull();
  });

  test('aceita preço zero', () => {
    expect(validarProduto('Produto', 10, 0)).toBeNull();
  });
});

// ────────────────────────────────────────────────────
// criarProduto
// ────────────────────────────────────────────────────
describe('criarProduto()', () => {
  test('cria produto com dados válidos', () => {
    const result = criarProduto('Mouse Gamer', 'eletronicos', 15, 199.90);
    expect(result.sucesso).toBe(true);
    expect(result.produto.nome).toBe('Mouse Gamer');
    expect(result.produto.categoria).toBe('eletronicos');
    expect(result.produto.qtd).toBe(15);
    expect(result.produto.preco).toBe(199.90);
  });

  test('produto criado recebe id numérico', () => {
    const result = criarProduto('Teclado', 'eletronicos', 5, 150);
    expect(typeof result.produto.id).toBe('number');
  });

  test('produto criado recebe SKU gerado automaticamente', () => {
    const result = criarProduto('Monitor', 'eletronicos', 3, 800);
    expect(result.produto.sku).toMatch(/^ELE\d{4}$/);
  });

  test('falha ao criar produto sem nome', () => {
    const result = criarProduto('', 'eletronicos', 5, 100);
    expect(result.sucesso).toBe(false);
    expect(result.mensagem).toBe('Nome do produto é obrigatório.');
  });

  test('falha ao criar produto com quantidade negativa', () => {
    const result = criarProduto('Produto', 'outros', -3, 50);
    expect(result.sucesso).toBe(false);
  });

  test('falha ao criar produto com preço negativo', () => {
    const result = criarProduto('Produto', 'outros', 10, -10);
    expect(result.sucesso).toBe(false);
  });

  test('remove espaços extras do nome', () => {
    const result = criarProduto('  Cadeira  ', 'outros', 2, 500);
    expect(result.produto.nome).toBe('Cadeira');
  });
});

// ────────────────────────────────────────────────────
// atualizarProduto
// ────────────────────────────────────────────────────
describe('atualizarProduto()', () => {
  test('atualiza produto existente com sucesso', () => {
    const criado = criarProduto('Caneta', 'outros', 50, 2.50);
    const id = criado.produto.id;

    const result = atualizarProduto(id, 'Caneta Azul', 'outros', 100, 3.00);
    expect(result.sucesso).toBe(true);
    expect(result.produto.nome).toBe('Caneta Azul');
    expect(result.produto.qtd).toBe(100);
    expect(result.produto.preco).toBe(3.00);
  });

  test('retorna erro para produto inexistente', () => {
    const result = atualizarProduto(99999, 'X', 'outros', 1, 1);
    expect(result.sucesso).toBe(false);
    expect(result.mensagem).toBe('Produto não encontrado.');
  });

  test('valida dados ao atualizar', () => {
    const criado = criarProduto('Borracha', 'outros', 10, 1);
    const result = atualizarProduto(criado.produto.id, '', 'outros', 10, 1);
    expect(result.sucesso).toBe(false);
  });
});

// ────────────────────────────────────────────────────
// deletarProduto
// ────────────────────────────────────────────────────
describe('deletarProduto()', () => {
  test('deleta produto existente com sucesso', () => {
    const criado = criarProduto('Régua', 'outros', 20, 1.50);
    const result = deletarProduto(criado.produto.id);
    expect(result.sucesso).toBe(true);
  });

  test('retorna erro ao deletar produto inexistente', () => {
    const result = deletarProduto(99999);
    expect(result.sucesso).toBe(false);
    expect(result.mensagem).toBe('Produto não encontrado.');
  });

  test('produto é removido da lista após deleção', () => {
    const criado = criarProduto('Clips', 'outros', 100, 0.50);
    const id = criado.produto.id;
    deletarProduto(id);
    const encontrado = buscarProdutos('Clips', '');
    expect(encontrado.length).toBe(0);
  });
});

// ────────────────────────────────────────────────────
// buscarProdutos
// ────────────────────────────────────────────────────
describe('buscarProdutos()', () => {
  beforeEach(() => {
    criarProduto('Notebook Dell', 'eletronicos', 5, 3500);
    criarProduto('Mouse Logitech', 'eletronicos', 20, 150);
    criarProduto('Arroz 5kg', 'alimentacao', 100, 25);
  });

  test('retorna todos os produtos sem filtro', () => {
    const resultado = buscarProdutos('', '');
    expect(resultado.length).toBeGreaterThanOrEqual(3);
  });

  test('filtra por nome corretamente', () => {
    const resultado = buscarProdutos('notebook', '');
    expect(resultado.some(p => p.nome === 'Notebook Dell')).toBe(true);
  });

  test('busca é case insensitive', () => {
    const resultado = buscarProdutos('MOUSE', '');
    expect(resultado.some(p => p.nome === 'Mouse Logitech')).toBe(true);
  });

  test('filtra por categoria corretamente', () => {
    const resultado = buscarProdutos('', 'alimentacao');
    expect(resultado.every(p => p.categoria === 'alimentacao')).toBe(true);
  });

  test('retorna array vazio para busca sem resultados', () => {
    const resultado = buscarProdutos('produto inexistente xyz', '');
    expect(resultado.length).toBe(0);
  });
});

// ────────────────────────────────────────────────────
// calcularStats
// ────────────────────────────────────────────────────
describe('calcularStats()', () => {
  test('calcula total de produtos corretamente', () => {
    criarProduto('A', 'outros', 10, 10);
    criarProduto('B', 'outros', 10, 10);
    const stats = calcularStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
  });

  test('identifica produtos com estoque baixo (qtd <= 5)', () => {
    criarProduto('Produto Baixo', 'outros', 3, 10);
    const stats = calcularStats();
    expect(stats.estoqueBaixo).toBeGreaterThanOrEqual(1);
  });

  test('calcula valor total corretamente', () => {
    // 10 unidades * R$5 = R$50
    criarProduto('Produto Valor', 'outros', 10, 5);
    const stats = calcularStats();
    expect(stats.valorTotal).toBeGreaterThanOrEqual(50);
  });
});

// ────────────────────────────────────────────────────
// escHtml
// ────────────────────────────────────────────────────
describe('escHtml()', () => {
  test('escapa caractere <', () => {
    expect(escHtml('<script>')).toBe('&lt;script&gt;');
  });

  test('escapa caractere &', () => {
    expect(escHtml('a & b')).toBe('a &amp; b');
  });

  test('não altera texto simples', () => {
    expect(escHtml('Texto normal')).toBe('Texto normal');
  });

  test('converte número para string e retorna sem alteração', () => {
    expect(escHtml(123)).toBe('123');
  });
});
