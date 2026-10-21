# JobAgentForCN

从营销号文章中收集央企/国企招聘链接，经过筛选和定制后，由本人确认并投递的个人求职辅助工具。

当前进度：前端（录入页 + 登录 + 提交记录）已完成，后端抽取、核验、简历定制和定时任务待开发。

## 功能（当前版本）

- 密码登录，适合部署到公网
- 录入页：粘贴文章链接并提交，手机端优先适配
- 最近提交记录：查看提交状态

## 技术栈

- 后端：FastAPI + SQLite（标准库 sqlite3）
- 前端：原生 HTML / CSS / JavaScript，无需构建步骤

## 目录结构

```
JobAgentForCN/
├── backend/
│   ├── main.py        # 应用入口，挂载 API 与静态页面
│   ├── config.py      # 读取 .env 配置
│   ├── auth.py        # 密码校验与登录态
│   ├── db.py          # SQLite 数据访问
│   └── routes.py      # API 路由
├── frontend/
│   ├── index.html     # 录入页
│   ├── login.html     # 登录页
│   ├── app.js
│   ├── login.js
│   └── style.css
├── .env.example       # 配置模板
├── requirements.txt
└── README.md
```

## 本地运行

需要 Python 3.10 或以上。

1. 创建虚拟环境并安装依赖（Windows PowerShell）：

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

2. 复制配置文件并填写：

   ```powershell
   copy .env.example .env
   ```

   `APP_PASSWORD` 为登录密码；`SECRET_KEY` 建议用下面的命令生成：

   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. 启动服务：

   ```powershell
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. 电脑浏览器访问 `http://localhost:8000`。手机与电脑在同一局域网时，访问 `http://电脑局域网IP:8000`，并允许 Windows 防火墙放行 8000 端口。

## 配置说明

| 变量 | 说明 |
|---|---|
| `APP_PASSWORD` | 登录密码，必填 |
| `SECRET_KEY` | 用于生成登录令牌，必填，建议长随机字符串 |
| `DB_PATH` | SQLite 数据库路径，默认 `data/jobagent.db` |
| `COOKIE_SECURE` | 使用 HTTPS 时设为 `true` |

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/login` | 密码登录 |
| POST | `/api/logout` | 退出登录 |
| GET | `/api/me` | 检查登录状态 |
| POST | `/api/submit` | 提交链接，body: `{"url": "..."}` |
| GET | `/api/submissions?limit=20` | 查询最近提交记录 |

## 注意事项

- `.env` 与 `data/` 已加入 `.gitignore`，不要提交真实密码和数据库。
- 本项目仅用于个人求职信息整理，投递操作由本人完成。
