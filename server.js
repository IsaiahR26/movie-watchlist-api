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


