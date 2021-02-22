const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/characters', async(req, res) => {
  try {
    const data = await client.query('SELECT * from characters');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/characters', async(req, res) => {
  try {
    const data = await client.query(
      `INSERT INTO characters (name, good_guy, image_url, age, category, quote, owner_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `, [
        req.body.name,
        req.body.good_guy,
        req.body.image_url,
        req.body.age,
        req.body.category,
        req.body.quote,
        1
      ]
    );
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/characters/:name', async(req, res) => {
  try {
    let name = req.params.name;
    const data = await client.query(`SELECT * from characters WHERE name = '${name}'`);
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/characters/:name', async(req, res) => {
  try {
    let name = req.params.name;
    const data = await client.query(
      `DELETE from characters WHERE name = '${name}'`
    );
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/characters/:name', async(req, res) => {
  try {
    let name = req.params.name;
    const data = await client.query(
      `UPDATE characters
       SET name = $1,
           good_guy = $2,
           image_url = $3,
           age = $4,
           category = $5,
           quote = $6,
           owner_id = $7
       WHERE name = '${name}'
       RETURNING *`, [
        req.body.name,
        req.body.good_guy,
        req.body.image_url,
        req.body.age,
        req.body.category,
        req.body.quote,
        1]
    );
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories/:category', async(req, res) => {
  try {
    let category = req.params.category;
    const data = await client.query(`SELECT * from characters WHERE category = '${category}'`);
    res.json(data.rows);
  }
  catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
