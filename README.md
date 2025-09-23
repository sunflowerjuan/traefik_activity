# Gateway de servicios con Traefik

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
LIMIT 10000
MATCH (m:Movie {id: toInteger(row.id)})
UNWIND companies AS companyName
WITH m, trim(companyName) AS companyName
WHERE companyName <> "" AND companyName IS NOT NULL
MERGE (pc:ProductionCompany {name: companyName})
MERGE (m)-[:PRODUCED_BY]->(pc);
```

## Topologia y redes

Docker-Compose para punto 1
![Compose](img/compose_1.png)

Neon4j no es accesible desde el host

Contenedor con la base de datos

![Ps](img/ps-1.png)

Intentar ingresar desde el navegador al puerto

![Exp](img/exp-1.png)

## Rutas “estructuradas”

Agregamos los routers para nuestra api y probamos el siguiente comando:

```bash
curl http://api.localhost/health
```

Tenemos la siguiente salida:
![Healt](img/healt.png)

Configuramos el Midleware con el basic-Auth en nuestro traefik y verificamos que es inaccesible si no ponemos credenciales:
![Unauthorized](img/401.png)

Ingresamos al dashboard con las credenciales configuradas:
![dash](img/dashboard.png)
