#!/bin/bash

# Start PostgreSQL service
service postgresql start

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
while ! pg_isready -q -h localhost -p 5432 -U lawmox_user; do
    echo "PostgreSQL is not ready yet. Waiting..."
    sleep 2
done

# Create database and user
echo "Setting up database..."
sudo -u postgres psql -c "CREATE USER lawmox_user WITH PASSWORD 'lawmox_password';" || echo "User already exists"
sudo -u postgres psql -c "CREATE DATABASE lawmox_entity_tracker OWNER lawmox_user;" || echo "Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lawmox_entity_tracker TO lawmox_user;" || echo "Privileges already granted"

# Start supervisor to run all services
echo "Starting all services with supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
