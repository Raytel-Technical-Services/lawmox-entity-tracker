#!/bin/bash
set -e

# Create database and user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER lawmox_user WITH PASSWORD 'lawmox_password';
    GRANT ALL PRIVILEGES ON DATABASE lawmox_entity_tracker TO lawmox_user;
EOSQL
