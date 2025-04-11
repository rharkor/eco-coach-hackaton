up:
	docker compose -f docker/docker-compose.yml up -d

down:
	docker compose -f docker/docker-compose.yml down

logs:
	docker compose -f docker/docker-compose.yml logs -f

psql:
	docker exec -it postgres-rag-chatbot psql -U postgres -d postgres

