const { Pool } = require('pg');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "root",
    database: "controle-assinatura-bd"
});

// Rota para buscar todos os dados
app.get('/fetchData', async (req, res) => {
    const { data } = req.query; // Pega o parâmetro de data da query string

    let fetch_query = "SELECT * FROM signature_day";
    const queryParams = [];

    // Se a data for fornecida, adiciona o filtro
    if (data) {
        fetch_query += " WHERE data = $1";
        queryParams.push(data); // Adiciona a data aos parâmetros
    }

    pool.query(fetch_query, queryParams, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result.rows);
        }
    });
});


// Rota para buscar por ID
app.get('/fetchById/:id', async (req, res) => {
    const id = req.params.id;
    const fetcht_query = "SELECT * FROM signature_day WHERE id = $1";
    pool.query(fetcht_query, [id], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result.rows);
        }
    });
});

// Rota para inserir dados
app.post('/postData', async (req, res) => {
    const { processo, interessado, setor, tipo_documento, valor, sgd, providencia } = req.body;

    // Validação básica dos dados recebidos
    if (!processo || !interessado || !setor || !tipo_documento || valor == null || !sgd || providencia == null) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const insert_query = `
        INSERT INTO signature_day (processo, interessado, setor, tipo_documento, valor, sgd, providencia, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    try {
        const result = await pool.query(insert_query, [
            processo, interessado, setor, tipo_documento, valor, sgd, providencia, new Date() // Data atual
        ]);
        console.log(result);
        res.status(201).json({ message: "Dados inseridos com sucesso." });
    } catch (err) {
        console.error("Erro ao inserir dados:", err);
        res.status(500).json({ error: "Erro ao inserir dados no servidor." });
    }
});

// Rota para atualizar dados por ID
app.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    const { processo, interessado, setor, tipo_documento, valor, sgd, providencia } = req.body;

    const update_query = `
        UPDATE signature_day 
        SET processo = $1, interessado = $2, setor = $3, tipo_documento = $4, valor = $5, sgd = $6, providencia = $7, data = $8 
        WHERE id = $9
    `;
    try {
        const result = await pool.query(update_query, [
            processo, interessado, setor, tipo_documento, valor, sgd, providencia, new Date(), id // Atualiza também a data
        ]);
        res.status(200).json({ message: "Dados atualizados com sucesso." });
    } catch (err) {
        console.error("Erro ao atualizar dados:", err);
        res.status(500).json({ error: "Erro ao atualizar dados no servidor." });
    }
});

// Rota para deletar dados por ID
app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const delete_query = "DELETE FROM signature_day WHERE id = $1";
    pool.query(delete_query, [id], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(`Registro com id = ${id} deletado.`);
        }
    });
});

// Conectar ao banco de dados
pool.connect()
    .then(() => console.log("Conectado ao PostgreSQL"))
    .catch(err => console.error("Erro de conexão", err.stack));

app.listen(3001, () => {
    console.log("Servidor está rodando na porta 3001...");
});
