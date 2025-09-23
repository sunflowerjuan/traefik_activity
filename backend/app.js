require("dotenv").config();

const os = require("os");
const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// 👇 Aquí agregamos el middleware
app.use(express.json());

app.get("/movies", async (req, res) => {
  const session = driver.session();

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 50;
  if (limit > 50) limit = 50;

  const skip = (page - 1) * limit;

  try {
    const result = await session.run(
      "MATCH (m:Movie) RETURN m.title AS title, m.original_language AS language SKIP $skip LIMIT $limit",
      { skip: neo4j.int(skip), limit: neo4j.int(limit) }
    );

    const movies = result.records.map((record) => ({
      title: record.get("title"),
      language: record.get("language"),
    }));

    res.json({
      page,
      limit,
      results: movies.length,
      movies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

app.post("/movies", async (req, res) => {
  const session = driver.session();

  const {
    id,
    title,
    original_title,
    overview,
    original_language,
    release_date,
    runtime,
    status,
    budget,
    revenue,
    popularity,
    vote_average,
    vote_count,
  } = req.body;

  if (!title || !id) {
    return res
      .status(400)
      .json({ error: "Los campos 'id' y 'title' son obligatorios" });
  }

  try {
    const result = await session.run(
      `CREATE (m:Movie {
        id: $id,
        title: $title,
        original_title: $original_title,
        overview: $overview,
        original_language: $original_language,
        release_date: $release_date,
        runtime: $runtime,
        status: $status,
        budget: $budget,
        revenue: $revenue,
        popularity: $popularity,
        vote_average: $vote_average,
        vote_count: $vote_count
      })
      RETURN m`,
      {
        id: neo4j.int(id),
        title,
        original_title,
        overview,
        original_language,
        release_date,
        runtime: runtime ? neo4j.int(runtime) : null,
        status,
        budget: budget ? neo4j.int(budget) : 0,
        revenue: revenue ? neo4j.int(revenue) : 0,
        popularity,
        vote_average,
        vote_count: vote_count ? neo4j.int(vote_count) : 0,
      }
    );

    const createdMovie = result.records[0].get("m").properties;

    res.status(201).json({
      message: "Movie creada exitosamente",
      movie: createdMovie,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/whoami", (req, res) => {
  res.json({
    hostname: os.hostname(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
