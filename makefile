.PHONY: install dev build preview lint format deploy resume brand clean

start:
	@cat envs/.env.local > .env
	@npm run dev

install:
	@npm install

.PHONY: build
build:
	@rm -rf build
	@cat envs/.env.prod > .env
	@npm run build
	@npm pkg get version | tr -d '"' > build/version.txt
	@date -u +"%Y-%m-%dT%H:%M:%SZ" > build/relv.txt

preview: build
	@npm run preview

lint:
	@npm run lint

format:
	@npm run format

# Pushes build/ to the gh-pages branch of samarthpal.github.io (same flow as 2.0)
sync: build
	@cat envs/.env.prod > .env
	@npx gh-pages -d build

# Regenerates public/resume.pdf from src/data/profile.json (needs: pip install reportlab)
resume:
	@python3 scripts/build_resume.py

# Regenerates public/apple-touch-icon.png, icon-512.png and og.png (needs: pip install pillow)
brand:
	@python3 scripts/build_brand.py

clean:
	@rm -rf build	