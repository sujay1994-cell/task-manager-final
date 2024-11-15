#!/bin/bash

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Installing MongoDB..."
    
    # Install MongoDB in Replit
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org

    # Create data directory
    mkdir -p ~/data/db
fi

# Start MongoDB
mongod --dbpath ~/data/db --bind_ip 127.0.0.1 &

# Wait for MongoDB to start
sleep 5

# Create database and user
mongo magazine_db --eval '
  db.createUser({
    user: "admin",
    pwd: "password",
    roles: [{ role: "readWrite", db: "magazine_db" }]
  })
'

echo "MongoDB setup complete!" 