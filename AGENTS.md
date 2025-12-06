# Repository Guidelines

## TOP RULES
- 沟通机制：回复必须使用中文。对于非纯文本修改的任务，必须优先提供设计方案，待我确认后方可编写代码。
- 复用原则：严格优先使用项目现有的组件、工具类和架构模式。
    - 注意：由于你可能无法读取全量代码，如果你推测可能存在相关组件但不确定位置，请先询问我，而不是直接制造重复轮子。
- 代码质量与兼容性：在重构或修改功能时，若发现兼容性冲突：
    - 首选策略：暴露问题，提出彻底的改进方案（不妥协）。
    - 备选策略：如果彻底改进影响范围过大（超过5个文件或涉及核心底层），请同时提供一个“最小侵入性”的兼容方案（如适配器模式），并说明两者的利弊，由我决策。

## Project Structure & Modules
- `backend/`: Flask API service. Business logic split across `routes/` (blueprints by domain), `models/` (SQLAlchemy models), `utils/`, and `instance/` for local data/config. `app.py` bootstraps the service and seeds demo content.
- `wechat_end/`: WeChat Mini Program. UI pages live under `pages/`, shared state under `store/`, utilities under `utils/`, and static assets in `images/` and `custom-tab-bar/`. Project metadata is in `project.config.json`.
- `mobile_end/`, `web_end/`: currently placeholders; keep stubs intact for future clients.

## Build, Test, and Development Commands
- Backend setup (from repo root):
  ```bash
  cd backend
  python3 -m venv venv && source venv/bin/activate
  pip install -r requirements.txt
  python app.py  # starts on http://localhost:5010
  ```
- Quick smoke check: `curl http://localhost:5010/api/health` should return a healthy status.
- Docker (backend): `docker build -t babysitting-backend ./backend` then `docker run -p 5010:5000 babysitting-backend`. For compose, use `docker-compose -f backend/docker-compose.yml up -d`.
- WeChat client: open `wechat_end/` in WeChat DevTools (use project.config.json), run “构建 npm” if prompted, then “编译/预览” for local verification.

## Coding Style & Naming Conventions
- Python: follow PEP 8, 4-space indents, `snake_case` functions/variables, `PascalCase` models. Keep responses consistent (`{"status": "...", "message": "...", ...}`) and group routes per blueprint in `routes/`.
- Mini Program: 2-space indents (config defaults), keep page folders cohesive (`pages/<feature>/index.{wxml,wxss,js,json}`), and prefer small utilities in `utils/` over inline helpers.
- Configuration: prefer environment variables over hard-coded defaults; add docstrings for non-trivial functions and keep module boundaries clear.

## Testing Guidelines
- No shared suite exists yet; add backend tests alongside features using `pytest` and Flask’s test client. Organize under `backend/tests/` with `test_<module>.py`. Example run (after adding pytest to dev deps): `pytest backend/tests -q`.
- For Mini Program changes, exercise flows in WeChat DevTools (login, navigation, API calls) and note manual steps in PRs. Include screenshots when UI is touched.

## Commit & Pull Request Guidelines
- Git history currently uses short, descriptive Chinese summaries (e.g., “整合先前代码，准备进一步开发”); keep one-line summaries under ~72 chars. If helpful, prefix with feature area (e.g., `auth: ...`).
- PRs should list scope, endpoints or pages touched, env/config notes, and test evidence (commands run or manual checks). Attach screenshots/gif for client-facing changes. Link issues or tasks when available and flag breaking DB or API changes explicitly.

## Security & Configuration Tips
- Do not commit secrets. Override `SECRET_KEY`, `JWT_SECRET_KEY`, database URLs, and WeChat credentials via environment variables or a local `.env` ignored from VCS. Replace placeholder secrets before deploying.
- Be cautious with sample data created in `create_test_data()`; disable or gate it for production deployments and avoid logging sensitive payloads.
