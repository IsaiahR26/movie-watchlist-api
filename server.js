const express =  require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* DATABASE CONNECTION */

const pool = new POOl ({
    user: "postgres",
    host: "localhost",
    database: "movie_watchlist_api",
    password: process.env.DB_PASSWORD,
    port: 5432,
});

/* TEST THE ROUTE */

app.get ("/", (req, res) => {
    res.send("Movie Watchlist API is running");
});

/* GET MOVIES */

app.get("/api/v1/movies", async (req, res) => {
    try {
        const { stuatus, favorite } = req.query;

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
