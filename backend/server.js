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

// ----- NOVAS ROTAS PARA PÁTIOS E MOTOS -----

// Rota para buscar os detalhes de um pátio específico
app.get('/api/yards/:id', async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT id, name, address, map_type, polygon_geojson FROM YARDS WHERE id = :id`,
            { id: id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Retorna objetos JS
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pátio não encontrado.' });
        }

        // O Oracle retorna nomes de colunas em MAIÚSCULAS, vamos padronizar para minúsculas
        const yardData = result.rows[0];
        const formattedYard = {
            id: yardData.ID,
            name: yardData.NAME,
            address: yardData.ADDRESS,
            map_type: yardData.MAP_TYPE,
            polygon_geojson: await yardData.POLYGON_GEOJSON.getData(), // Lendo o CLOB
        };

        res.status(200).json({ data: formattedYard });

    } catch (err) {
        console.error('Erro ao buscar pátio:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error('Erro ao fechar conexão:', e); }
        }
    }
});

// Rota para buscar as motocicletas de um pátio específico
app.get('/api/motorcycles', async (req, res) => {
    const { yardId } = req.query; // Pega o yardId da URL, ex: /api/motorcycles?yardId=1
    if (!yardId) {
        return res.status(400).json({ message: 'O parâmetro yardId é obrigatório.' });
    }
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT id, plate, model, status, yard_id, last_lat, last_lng FROM MOTORCYCLES WHERE yard_id = :yardId`,
            { yardId: yardId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Padronizando a saída para minúsculas
        const formattedMotorcycles = result.rows.map(moto => ({
            id: moto.ID,
            plate: moto.PLATE,
            model: moto.MODEL,
            status: moto.STATUS,
            yard_id: moto.YARD_ID,
            last_lat: moto.LAST_LAT,
            last_lng: moto.LAST_LNG,
        }));

        res.status(200).json({ data: { motorcycles: formattedMotorcycles } });

    } catch (err) {
        console.error('Erro ao listar motocicletas:', err);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error('Erro ao fechar conexão:', e); }
        }
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});