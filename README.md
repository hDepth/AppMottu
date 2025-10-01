# 🛵 MottuGestor – Mapeamento Digital de Motos em Pátios

> Challenge FIAP – 2TDS | Fevereiro 2025 – 1º Semestre  

Aplicativo em **React Native (Expo)** para **gestão digital de motos em pátios da Mottu**, com:
- Mapa interativo em **SVG + Grid 2D**
- CRUD de motos
- Criação de áreas em pátios
- Autenticação com **API Node.js + Oracle**
- Integração parcial com **API .NET 8**

---

## 📖 Resumo da Proposta

O **MottuGestor** foi desenvolvido para resolver o desafio de **organizar e monitorar digitalmente motos em pátios usando RFID**.  

### Problema:
A Mottu precisa **mapear e controlar motos** em diferentes pátios, com informações de status e localização, de forma prática.

### Solução:
- **Visualização interativa** de pátios em formato de mapa.
- **Áreas personalizadas** que podem ser criadas, movidas e redimensionadas.
- **Motos cadastradas** associadas às áreas, exibidas com status e cálculo de distância simulada até o usuário.
- **Autenticação segura** via API caseira em Node.js + Oracle.
- **Integração com API .NET** para operações de CRUD (parcialmente implementada).

---

## 🗂 Estrutura do Projeto

📦 AppMottu
┣ 📂 src
┃ ┣ 📂 screens # Telas principais (Motos, Pátios, Mapas, Login)
┃ ┣ 📂 components # Componentes reutilizáveis (Modais, Cards, Tooltips)
┃ ┣ 📂 services # Integração com APIs (.NET e Node.js)
┃ ┣ 📂 style # Definições de estilos e cores
┃ ┗ 📂 config # Configurações auxiliares (modelos de motos, etc.)
┣ 📂 backend # API caseira em Node.js + Oracle (autenticação)
┣ 📂 MottuGestor.API# API em .NET 8 (motos e pátios)
┗ README.md

---

## 🚀 Funcionalidades

✅ **CRUD de Motos**  
- Cadastrar, listar, editar e excluir motos  
- Associação de motos a áreas/pátios  
- Status coloridos: Disponível, Em Manutenção, Alugada, Aguardando Revisão  

✅ **Gestão de Pátios e Áreas**  
- 4 pátios disponíveis  
- Criar áreas customizadas dentro dos pátios  
- Áreas podem ser movidas e redimensionadas livremente  

✅ **Mapa em Grid 2D (SVG)**  
- Simulação visual da disposição das motos  
- Tooltip com informações (modelo, placa, status, área, distância simulada)  

✅ **Autenticação**  
- Registro e login de usuários  
- Senhas armazenadas com hash (bcrypt) no Oracle  

✅ **Integração API**  
- **Branch `MapaSvgGrid2D`** → uso 100% local com AsyncStorage (mais completa e estável).  
- **Branch `IntegracaoApiOracle`** → integração com API .NET 8 (CRUD de motos e pátios) + API caseira Node.js (login).  

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) (>= 18)  
- [Expo CLI](https://docs.expo.dev/)  
- [Android Studio](https://developer.android.com/studio) (para emulador Android)  
- [Oracle Client](https://www.oracle.com/database/technologies/instant-client.html) (para API Node.js)  
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download) (para API .NET)  

---

## 🛠 Passo a Passo de Execução

### 🔹 1. Clonar o projeto
```bash
git clone <url-do-repositorio>
cd AppMottu
🔹 2. Branch MapaSvgGrid2D (versão mais estável – AsyncStorage)
bash
Copiar código
git checkout MapaSvgGrid2D
npm install
Backend (autenticação com Oracle)
bash
Copiar código
cd backend
node server.js
App
bash
Copiar código
cd ..
npm run start
Abrir no emulador Android Studio

Testar login, registro, CRUD de motos e mapas

🔹 3. Branch IntegracaoApiOracle (com API .NET 8)
bash
Copiar código
git checkout IntegracaoApiOracle
npm install
Backend (API .NET 8 – motos/pátios)
Baixar a pasta MottuGestor.API enviada junto ao projeto.

Abrir no terminal e rodar:

bash
Copiar código
dotnet restore
dotnet build
cd MottuGestor.API
dotnet run
Backend (API Node.js – autenticação)
bash
Copiar código
cd backend
node server.js
App
bash
Copiar código
cd ..
npm run start
🧪 Como Testar
Criar usuário → /register

Fazer login → /login

Criar áreas → direto no app (AsyncStorage)

Cadastrar motos → branch MapaSvgGrid2D (local) ou API .NET na branch IntegracaoApiOracle

Visualizar no mapa → motos aparecem nas áreas com status e tooltip

🛠 Tecnologias Utilizadas
Frontend: React Native (Expo), AsyncStorage, SVG/Grid2D

Backend (Autenticação): Node.js, Express, OracleDB, Bcrypt

Backend (Motos/Pátios): .NET 8 Web API, OracleDB

Banco de Dados: Oracle Cloud

Outros: Axios, CORS, Body-Parser

👨‍👩‍👧‍👦 Autores
Pedro Henrique Jorge De Paula – RM 558833

Jennifer Kaori Suzuki – RM 554661

Felipe Levy Stephens Fidelix – RM 556426
