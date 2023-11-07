# Money Split App

## How to run

1. Docker

```
docker compose run api yarn
docker compose run api yarn migration up
docker compose up -d
```

2. Local

- Install PostgreSQL 
- Create a database 
- Update values in .env and .env.test
- yarn 



## Directory Structure
- `src/api` -> Application / HTTP Layer

- `src/business` -> Data / Service Layer

- `src/base` -> foundational utils and shared modules

## Data flows like so 

Database -> Repository -> Service -> Application -> User

## Side notes
Repositories use DTO objects that are converted into Domain objects on service layer 

so that api response remains same  irrespective of DB schema changes

Also for `/api/v2` service layer can get v2 models etc 
