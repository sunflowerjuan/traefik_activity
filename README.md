# TALLER TRAEFIK

Query para los datos

Cargar peliculas

```neon4j
LOAD CSV WITH HEADERS FROM 'file:///AllMoviesDetails_w.csv' AS row
FIELDTERMINATOR ';'
WITH row
LIMIT 10000
CREATE (m:Movie {
  id: toInteger(row.id),
  title: row.title,
  original_title: row.original_title,
  overview: row.overview,
  original_language: row.original_language,
  release_date: row.release_date,
  runtime: coalesce(toInteger(row.runtime), 0),
  status: row.status,
  budget: coalesce(toInteger(row.budget), 0),
  revenue: coalesce(toInteger(row.revenue), 0),
  popularity: coalesce(toFloat(row.popularity), 0.0),
  vote_average: coalesce(toFloat(row.vote_average), 0.0),
  vote_count: coalesce(toInteger(row.vote_count), 0)
});

```

crear nodos

```neon4j
LOAD CSV WITH HEADERS FROM 'file:///AllMoviesDetails_w.csv' AS row
FIELDTERMINATOR ';'
WITH row, split(row.production_companies, "|") AS companies
MATCH (m:Movie {id: toInteger(row.id)})
UNWIND companies AS companyName
MERGE (pc:ProductionCompany {name: companyName})
MERGE (m)-[:PRODUCED_BY]->(pc);
```
