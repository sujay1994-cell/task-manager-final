#!/bin/bash

kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
}

# Kill processes on common ports
kill_port 3000
kill_port 3001
kill_port 5000 