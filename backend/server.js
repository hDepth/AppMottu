// server.js
const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Para permitir requisições do seu app React Native

const app = express();
const port = 3000;

// Configuração do body-parser para JSON
app.use(bodyParser.json());
app.use(cors()); 

// Configuração do banco de dados Oracle 
const dbConfig = {
    user          : "rm558833",
    password      : "200306",
    connectString : "oracle.fiap.com.br:1521/ORCL" // Ou o TNS alias, ou o endereço IP:porta/serviço
};

// Função para obter conexão com o banco de dados
async function getConnection() {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log('Conexão com o Oracle estabelecida com sucesso!');
        return connection;
    } catch (err) {
        console.error('Erro ao conectar ao Oracle:', err);
        throw err;
    }
}

// Rota de Registro
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body; // Adicionado 'email'

    if (!username || !email || !password) { // Validação de todos os campos
        return res.status(400).json({ message: 'Nome de usuário, e-mail e senha são obrigatórios.' });
    }

    let connection;
    try {
        connection = await getConnection();
        const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha

        const result = await connection.execute(
            `INSERT INTO users (username, email, password) VALUES (:username, :email, :password)`, // Inserindo email
            { username: username, email: email, password: hashedPassword },
            { autoCommit: true }
        );

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        if (err.errorNum === 1) { // ORA-00001: unique constraint violated
            // Checar qual constraint foi violada para mensagem de erro mais específica
            if (err.message.includes('USERNAME') || err.message.includes('USERS_USERNAME_UK')) { // Assumindo nome da constraint
                return res.status(409).json({ message: 'Nome de usuário já existe.' });
            } else if (err.message.includes('EMAIL') || err.message.includes('USERS_EMAIL_UK')) { // Assumindo nome da constraint
                return res.status(409).json({ message: 'E-mail já está em uso.' });
            }
            return res.status(409).json({ message: 'Registro duplicado. Nome de usuário ou e-mail já existe.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar conexão com o Oracle:', err);
            }
        }
    }
});

// Rota de Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    let connection;
    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT username, password FROM users WHERE username = :username`,
            { username: username }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        const user = result.rows[0];
        const storedHashedPassword = user[1]; // Supondo que a senha seja a segunda coluna

        const isMatch = await bcrypt.compare(password, storedHashedPassword);

        if (isMatch) {
            res.status(200).json({ message: 'Login realizado com sucesso!', username: user[0] });
        } else {
            res.status(401).json({ message: 'Senha incorreta.' });
        }

    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar conexão com o Oracle:', err);
            }
        }
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});