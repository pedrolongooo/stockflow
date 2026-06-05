# StockFlow — Gerenciamento de Estoque

Projeto desenvolvido para a disciplina de **DevOps**, utilizando Azure DevOps com Docker, Pipelines, Repos e Testes Automatizados.

---

## 📁 Estrutura do Projeto

```
estoque-app/
├── index.html              # Estrutura HTML da aplicação
├── css/
│   └── style.css           # Estilos visuais
├── js/
│   └── app.js              # Lógica CRUD (exportado para testes)
├── tests/
│   └── app.test.js         # Testes automatizados com Jest
├── Dockerfile              # Container Nginx para servir o app
├── azure-pipelines.yml     # Pipeline de CI/CD
├── package.json            # Configuração do Jest
└── README.md
```

---

## ✅ Funcionalidades

- Adicionar produto (nome, categoria, quantidade, preço)
- Editar produto via modal
- Remover produto com confirmação
- Busca em tempo real por nome ou SKU
- Filtro por categoria
- SKU gerado automaticamente por categoria
- Alertas de estoque baixo (≤ 5 unidades)
- Estatísticas no header (total, estoque baixo, valor total)
- Dados persistidos no `localStorage`

---

## 🧪 Rodando os Testes

```bash
# Instalar dependências
npm install

# Rodar testes
npm test

# Rodar com watch (desenvolvimento)
npm run test:watch
```

---

## 🐳 Rodando com Docker

```bash
# Build da imagem
docker build -t stockflow .

# Rodar o container
docker run -p 8080:80 stockflow

# Acessar no navegador
# http://localhost:8080
```

---

## 🔁 Pipeline Azure DevOps

A pipeline (`azure-pipelines.yml`) é disparada automaticamente a cada push e executa:

1. **Stage Testes** → Instala dependências, roda Jest, publica resultados
2. **Stage Docker** → Faz build da imagem (somente se os testes passarem)

---

## 📋 Organização no Azure Boards

Sprints sugeridas:

| Sprint | Tarefas |
|--------|---------|
| Sprint 1 | Setup do repositório, estrutura de arquivos, HTML base |
| Sprint 2 | CRUD completo (criar, editar, deletar, buscar) |
| Sprint 3 | Testes automatizados com Jest |
| Sprint 4 | Dockerfile + Pipeline de CI/CD |
