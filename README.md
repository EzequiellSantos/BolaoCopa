# Bolao Copa - Frontend

O Bolao Copa e uma aplicacao para organizar um bolao dos jogos da Copa do Mundo de 2026.

A ideia e simples: cada participante entra na plataforma, faz seus palpites para as partidas abertas, acompanha suas apostas e ve como esta no ranking geral. Do outro lado, quem administra o bolao consegue cadastrar usuarios, criar partidas, atualizar status, informar placares e manter tudo funcionando de um jeito mais organizado.

No fundo, o projeto nasceu para resolver aquele problema classico de bolao em planilha, mensagem perdida no grupo e placar atualizado na mao. Aqui a proposta e deixar a experiencia mais limpa, segura e facil de acompanhar.

## O que o sistema faz

- Login de usuarios com autenticacao.
- Area protegida para participantes autenticados.
- Permissao especial para administradores.
- Cadastro e gerenciamento de usuarios.
- Cadastro, edicao e controle de partidas.
- Apostas em placares dos jogos.
- Ranking geral dos participantes.
- Calculo de pontuacao conforme o resultado das apostas.

## Frontend

O frontend foi feito com foco em uma experiencia direta: o usuario entra, ve o que precisa fazer e acompanha o bolao sem complicacao.

Principais tecnologias usadas:

- **React** para construir as telas e componentes da aplicacao.
- **TypeScript** para deixar o codigo mais seguro e previsivel.
- **Vite** para desenvolvimento rapido e build otimizado.
- **React Router DOM** para organizar as rotas, paginas protegidas e navegacao.
- **Axios** para conversar com a API do backend.
- **Tailwind CSS** para estilizar a interface de forma pratica e responsiva.
- **Zustand** esta disponivel no projeto para gerenciamento de estado, caso seja necessario evoluir essa parte.

## Backend

O backend cuida das regras principais do bolao: autenticacao, usuarios, partidas, apostas, ranking e controle de permissoes.

Principais tecnologias usadas:

- **NestJS** como framework principal da API.
- **TypeScript** tambem no backend, mantendo o projeto mais consistente.
- **MongoDB** como banco de dados.
- **Mongoose** para modelar e acessar os dados no MongoDB.
- **JWT** para autenticacao dos usuarios.
- **Passport** para integrar as estrategias de autenticacao.
- **bcrypt** para proteger as senhas com hash.
- **class-validator** e **class-transformer** para validar os dados recebidos pela API.
- **Jest** para testes automatizados.

## Como rodar o frontend

Instale as dependencias:

```bash
npm install
```

Rode o projeto em modo de desenvolvimento:

```bash
npm run dev
```

Para gerar a versao de producao:

```bash
npm run build
```
