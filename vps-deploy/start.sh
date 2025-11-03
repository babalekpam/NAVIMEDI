#!/bin/bash
export NODE_ENV=production
export PORT=5000
export DATABASE_URL="postgresql://navimed_user:NaviMed2025!Secure@localhost:5432/navimed"
node dist/index.js
