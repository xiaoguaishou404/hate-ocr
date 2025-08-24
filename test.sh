#!/bin/bash

npm run build

docker-compose -f docker-compose.test.yml down

docker-compose -f docker-compose.test.yml up --build -d

sleep 5

echo "测试环境已启动，访问地址： http://localhost:8080"
