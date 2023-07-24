const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const SELECT_ALL_POSTS_QUERY = 'SELECT * FROM posts ORDER BY likes DESC;';
const INSERT_POST_QUERY = 'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *;';
const SELECT_POST_BY_ID_QUERY = 'SELECT * FROM posts WHERE id = $1;';
const UPDATE_LIKES_QUERY = 'UPDATE posts SET likes = $1 WHERE id = $2;';
const DELETE_POST_QUERY = 'DELETE FROM posts WHERE id = $1;';

const app = express();
const port = 3000;
const DB_CONFIG = {
    user: 'postgres',
    host: 'localhost',
    database: 'likeme',
    password: 'Jantty50602010',
    port: 5432,
  };


// Configuración de CORS
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool(
    DB_CONFIG
);

// Rutas relacionadas con la base de datos
app.get('/posts', async (req, res) => {
    try {
      const { rows } = await pool.query(SELECT_ALL_POSTS_QUERY);
      res.json(rows);
    } catch (err) {
      handleError(res, 'Error al obtener los posts', 500);
    }
  });
  
  app.post('/posts', async (req, res) => {
    const { titulo, img, descripcion, likes } = req.body;
    try {
      const query = INSERT_POST_QUERY;
      const values = [titulo, img, descripcion, likes || 0];
      const { rows } = await pool.query(query, values);
      res.json(rows[0]);
    } catch (err) {
      handleError(res, 'Error al agregar el post', 500);
    }
  });
  
  app.put('/posts/like/:id', async (req, res) => {
    const postId = req.params.id;
    try {
      const { rows } = await pool.query(SELECT_POST_BY_ID_QUERY, [postId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'El post no fue encontrado' });
      }
      const updatedLikes = rows[0].likes + 1;
      await pool.query(UPDATE_LIKES_QUERY, [updatedLikes, postId]);
      res.json({ message: 'Likes incrementados correctamente' });
    } catch (err) {
      handleError(res, 'Error al incrementar los likes', 500);
    }
  });
  
  app.delete('/posts/:id', async (req, res) => {
    const postId = req.params.id;
    try {
      const { rows } = await pool.query(SELECT_POST_BY_ID_QUERY, [postId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'El post no fue encontrado' });
      }
      await pool.query(DELETE_POST_QUERY, [postId]);
      res.json({ message: 'Post eliminado correctamente' });
    } catch (err) {
      handleError(res, 'Error al eliminar el post', 500);
    }
  });
  
  // Función para manejar los errores de manera genérica
  function handleError(res, errorMessage, statusCode) {
    console.error(errorMessage);
    res.status(statusCode).json({ error: errorMessage });
  }

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});