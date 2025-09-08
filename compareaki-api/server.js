const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Config do banco Postgres no Kubernetes
const pool = new Pool({
  user: "gragazzi",
  host: "compareaki-postgres-service", // nome do service no K8s
  database: "compareaki",
  password: "zxasqw12",
  port: 5432,
});

// Rota para listar todos os produtos
app.get("/produtos", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nome_produto, marca FROM produtos ORDER BY nome_produto");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// Rota para pegar detalhes de um produto + preços
app.get("/produtos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const precos = await pool.query(
  `SELECT pr.nome_produto, s.nome AS supermercado, p.preco, p.data
   FROM precos p
   JOIN produtos pr ON p.produto_id = pr.id
   JOIN supermercados s ON p.supermercado_id = s.id
   WHERE p.produto_id = $1
   ORDER BY p.data DESC`,
  [id]
);
    


    res.json(precos.rows); // Agora já retorna uma lista simples com nome_produto, supermercado e preco
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar detalhes do produto" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` CompareAki API rodando na porta ${PORT}`);
});

