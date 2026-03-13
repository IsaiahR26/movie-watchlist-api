const express =  require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.set("json spaces", 2);

/* DATABASE CONNECTION */

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new Pool({
      user: "postgres",
      host: "localhost",
      database: "movie_watchlist_api",
      password: process.env.DB_PASSWORD,
      port: 5432,
      ssl: false,
    });




/* const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
}); */

/*const pool = new Pool ({
    user: "postgres",
    host: "localhost",
    database: "movie_watchlist_api",
    password: process.env.DB_PASSWORD,
    port: 5432,
}); */

/* TEST THE ROUTE */

app.get ("/", (req, res) => {
    res.send("Movie Watchlist API is running");
});

/* GET MOVIES */

app.get("/api/v1/movies", async (req, res) => {
    try {
        const { status, favorite } = req.query;

        let query = "SELECT * FROM movies";
        const values = [];
        const conditions = [];

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        if (favorite !== undefined) {
            values.push(favorite === "true");
            conditions.push(`is_favorite = $${values.length}`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        const result = await pool.query(query,values);
        res.json(result.rows);
    
    }   catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching movies"});
    }
});

/* GET DATA BY ID */

app.get("/api/v1/movies/:id", async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        "SELECT * FROM movies WHERE id = $1",
        [id]
    );

    res.json(result.rows[0])
});

/* POST MOVIES (Basically adds movies to the GET MOVIES list) */

app.post("/api/v1/movies", async (req, res) => {
    try {
        const { title, release_year, status, rating, is_favorite } = req.body;

        const result = await pool.query(
          `INSERT INTO movies  (title, release_year, status, rating, is_favorite)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
           [title, release_year, status, rating, is_favorite]  
        );

        res.status(201).json(result.rows[0]);
    }   catch (error) {
        console.error(error);
        res.status(500).json({error: "Error adding movie"});
    }
});


/* PUT REQUEST (Updates exising data in table) */

app.put("/api/v1/movies/:id", async (req,res) => {
    try {
        const { id } = req.params;
        const { title, release_year, status, rating, is_favorite } = req.body;

        const result = await pool.query(
          `UPDATE movies
          SET title = $1,
          release_year = $2,
          status = $3,
          rating = $4,
          is_favorite = $5,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = $6
          RETURNING *`,
          [title, release_year, status, rating, is_favorite, id]  
        );

        res.json(result.rows[0]);
    }   catch(error) {
        console.error(error);
        res.status(500).json({ error: "Error updating movie"});
    }
});


app.listen (PORT, () => {
    console.log(`Server running on port ${PORT}`);
});