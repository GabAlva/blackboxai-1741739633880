# Pokémon Board Game - Frontend

Frontend do jogo de tabuleiro Pokémon desenvolvido com React, TypeScript, Tailwind CSS e Vite.

## 🚀 Tecnologias

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Axios](https://axios-http.com/)
- [React Router DOM](https://reactrouter.com/)

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes React
│   ├── auth/          # Componentes de autenticação
│   └── game/          # Componentes do jogo
├── contexts/          # Contextos React
├── hooks/             # Hooks personalizados
├── services/          # Serviços de API e WebSocket
├── types/             # Definições de tipos TypeScript
└── utils/             # Funções utilitárias
```

## 🛠️ Configuração do Ambiente

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📝 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a build de produção
- `npm run preview`: Visualiza a build de produção localmente
- `npm run lint`: Executa o linter
- `npm run typecheck`: Verifica os tipos TypeScript

## 🎮 Funcionalidades

- Autenticação de usuários
- Seleção de Pokémon inicial
- Tabuleiro interativo
- Batalhas Pokémon
- Sistema de turnos
- Chat em tempo real
- Ranking de jogadores

## 🔧 Configurações

### Tailwind CSS

O projeto utiliza Tailwind CSS para estilização, com configurações personalizadas para:

- Cores temáticas do Pokémon
- Fontes personalizadas
- Animações
- Componentes reutilizáveis

### TypeScript

Configuração completa do TypeScript com:

- Strict mode habilitado
- Path aliases configurados
- Tipos para todas as bibliotecas

### ESLint e Prettier

Configurações de linting e formatação de código:

- Regras ESLint personalizadas
- Integração com TypeScript
- Formatação automática com Prettier

## 🌐 Integração com Backend

O frontend se comunica com o backend através de:

- REST API usando Axios
- WebSocket usando Socket.IO
- Autenticação via JWT

## 📦 Build e Deploy

Para gerar uma build de produção:

```bash
npm run build
```

Os arquivos serão gerados no diretório `dist/`.

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.
