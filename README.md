📌 Proposta do Projeto

O AppMottu foi desenvolvido com o objetivo de facilitar a gestão de motos e pátios de uma frota, permitindo que administradores e operadores tenham uma visão clara da disponibilidade e movimentação dos veículos.

A solução conecta um aplicativo mobile a um backend em Node.js que integra diretamente com um banco de dados Oracle, garantindo persistência e confiabilidade das informações.

Assim, o sistema substitui soluções baseadas em armazenamento local (AsyncStorage) por um banco relacional robusto, permitindo múltiplos usuários, consistência de dados e maior escalabilidade.

⚙️ Funcionalidades
🔐 Autenticação

Login seguro com usuários cadastrados diretamente no banco Oracle.

Validação de credenciais no backend sem uso de JWT.

🏍️ Gestão de Motos

Cadastro de novas motos.

Listagem de todas as motos.

Edição e exclusão de registros.

Associação de motos a um pátio.

🅿️ Gestão de Pátios

Cadastro de pátios (nome, localização, capacidade).

Listagem de pátios cadastrados.

Visualização das motos vinculadas a um pátio.

📊 Outras Funcionalidades

Atualização em tempo real entre app e backend.

Persistência completa no banco de dados Oracle.

Estrutura pronta para escalabilidade (mais pátios, mais veículos, mais usuários).

📂 Estrutura do Projeto
AppMottu/
│── app/                  # Código do aplicativo mobile (React Native / Expo)
│   ├── screens/          # Telas do app (Login, Home, Motos, Pátios)
│   ├── components/       # Componentes reutilizáveis
│   ├── services/         # Integração com API
│   └── App.tsx           # Ponto de entrada do app
│
│── server/               # Backend (Node.js + Express + OracleDB)
│   ├── src/
│   │   ├── config/       # Configurações de banco
│   │   ├── routes/       # Rotas da API
│   │   ├── controllers/  # Lógica das rotas
│   │   └── index.js      # Ponto de entrada do servidor
│
│── database/             # Scripts SQL
│   ├── create_tables.sql # Criação de tabelas
│   └── seed.sql          # Dados de exemplo
│
│── README.md             # Documentação do projeto

👥 Integrantes do Grupo

Pedro de Paula – RM: 558833 – GitHub

Julia Almeida – RM: 123456 – GitHub

Carlos Silva – RM: 789012 – GitHub

🚀 Como Executar o Projeto
📌 Pré-requisitos

Node.js
 (>= 18.x)

npm
 ou yarn

Expo CLI
 (para rodar o app mobile)

Oracle XE
 ou servidor Oracle disponível

SQL Developer
 (opcional, para gerenciar o banco)

🔧 Passo 1 – Clonar o repositório
git clone https://github.com/seuusuario/AppMottu.git
cd AppMottu

🔧 Passo 2 – Configurar o Banco de Dados Oracle

Crie o usuário e conceda permissões:

CREATE USER appmottu IDENTIFIED BY senha;
GRANT CONNECT, RESOURCE TO appmottu;


Rode o script de criação de tabelas:

@database/create_tables.sql


(Opcional) Insira dados de teste:

@database/seed.sql

🔧 Passo 3 – Configurar o Backend

Acesse a pasta do servidor:

cd server


Instale as dependências:

npm install


Configure a conexão no arquivo src/config/database.js:

const DB_USER = process.env.DB_USER || 'appmottu';
const DB_PASSWORD = process.env.DB_PASSWORD || 'senha';
const DB_CONNECT = process.env.DB_CONNECT || 'oracle.fiap.com.br/ORCL';
const PORT = process.env.PORT || 3000;


Inicie o servidor:

npm start


O backend rodará em:
👉 http://localhost:3000

🔧 Passo 4 – Rodar o Aplicativo Mobile

Acesse a pasta do app:

cd app


Instale as dependências:

npm install


Inicie o app:

npx expo start


Escaneie o QR Code no seu celular (com o aplicativo Expo Go) ou rode em um emulador Android/iOS.

✅ Pronto! O AppMottu estará em funcionamento com banco Oracle integrado.
