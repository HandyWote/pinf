# Repository Guidelines


## Project Structure & Modules
- `backend/`: Flask API service. Business logic split across `routes/` (blueprints by domain), `models/` (SQLAlchemy models), `utils/`, and `instance/` for local data/config. `app.py` bootstraps the service.
- `wechat_end/`: **已弃用**的微信小程序代码，仅供参考/存档，不再维护。
- `mobile_end/`, `web_end/`: 仍为空壳；WAend 客户端将改为 **React Native** 重构（后续代码放在 mobile_end 或独立包，优先复用后端接口）。

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
- React Native 客户端：WAend 改为 RN 重构，当前仓库未包含 RN 代码；请在后续 RN 工程中接入本后端接口。旧小程序流程已弃用。

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
