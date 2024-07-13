start:
	@cat envs/.env.local > .env
	@npm start

.PHONY: build
build-dev:
	@cat envs/.env.dev > .env
	@npm run build

build-prod:
	@cat envs/.env.prod > .env
	@npm run build

sync-dev:
	@cat envs/.env.dev > .env
	@npm run deploy

sync-prod:
	@cat envs/.env.prod > .env
	@npm run deploy