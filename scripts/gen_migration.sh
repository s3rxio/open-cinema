#!/bin/bash

cd apps/api
# npm run typeorm -- migration:generate -d ./apps/api/src/config/db.config.ts ./apps/api/src/app/database/migrations/$1
npm run typeorm -- migration:generate -d ./apps/api/src/database/data-source.ts ./apps/api/src/app/database/migrations/$1