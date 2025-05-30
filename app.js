const express = require('express')
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // v4 é a versão mais usada

const app = express()
app.use(cors({
    origin: 'http://localhost:4200', // frontend do Ionic
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
pool.connect()
    .then(() => console.log('PostgreSQL conectado!'))
    .catch((err) => console.error('Erro ao conectar ao PostgreSQL:', err));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
const port = 3000

app.get('/pacientes', async (req, res) => {
    try {
        const pacientes = await pool.query('SELECT * FROM PACIENTES')
        res.json(pacientes.rows);
    }catch (error) {
        console.error('Erro ao buscar no banco:', error);
        res.status(500).json({ erro: 'Erro ao inserir usuário' });
    }
})


app.get('/hora', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.send(`Hora atual do banco: ${result.rows[0].now}`);
  });

app.post('/cadastro', async (req, res) => {
    const novoUsuario = {
        uuid: uuidv4(), // Gera um UUID único
        nome: req.body.nome,
        cpf: req.body.cpf,
        nsus: req.body.nSUS,
        nascimento: req.body.nascimento,
        preventivo: req.body.preventivo,
        risco: req.body.risco,
    };
    console.log(req.body)
    try {
        await pool.query(
          'INSERT INTO pacientes (uuid, nome, cpf, nsus, nascimento, preventivo, risco) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [novoUsuario.uuid, novoUsuario.nome, novoUsuario.cpf, novoUsuario.nsus, novoUsuario.nascimento, novoUsuario.preventivo, novoUsuario.risco]
        );
    
        res.status(201).json({ id: novoUsuario.uuid, nome: novoUsuario.nome });
      } catch (error) {
        console.error('Erro ao inserir no banco:', error);
        res.status(500).json({ erro: 'Erro ao inserir usuário' });
      }
    // res.send(req.body)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})