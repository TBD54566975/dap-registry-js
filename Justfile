set positional-arguments
set dotenv-filename := "backend/.env"
set dotenv-required
set dotenv-load := true

_help:
  @just -l

setup:
  - docker network create --driver bridge dap-backend

# Build the DAP Registry backend
@backend-image:
  echo "🏗️ Building backend Docker image..."
  docker build \
    --pull \
    --file $(PWD)/backend/Dockerfile \
    --tag dap-registry-backend \
    $(PWD)/backend

@run-backend:
  echo "🚀 Running backend Docker container..."
  docker run \
    --name registry-backend \
    --network dap-backend \
    --publish 3000:3000 \
    --env-file $(PWD)/backend/.env \
    --env DB_HOST=registry-db \
    --rm \
    --detach \
    dap-registry-backend

@run-db:
  echo "🚀 Running database Docker container..."
  docker run \
    --name registry-db \
    --network dap-backend \
    --publish 5432:5432 \
    --mount source=registry-db-vol,target=/var/lib/postgresql/data \
    --env POSTGRES_USER=${DB_USER} \
    --env POSTGRES_PASSWORD=${DB_PASSWORD} \
    --env POSTGRES_DB=${DB_NAME} \
    --rm \
    --detach \
    postgres:15
