# 早护通后端API服务

早护通是一个专为婴幼儿护理设计的综合服务平台，提供用户认证、儿童管理、内容管理、预约管理和聊天功能。

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [功能模块](#功能模块)
- [快速开始](#快速开始)
- [本地开发](#本地开发)
- [Docker部署](#docker部署)
- [服务器部署](#服务器部署)
- [API文档](#api文档)
- [环境配置](#环境配置)
- [常见问题](#常见问题)
- [维护指南](#维护指南)

## 🚀 项目简介

早护通后端API服务基于Flask框架开发，提供完整的RESTful API接口，支持微信小程序登录、儿童信息管理、育儿内容推荐、医疗预约和在线咨询等功能。

## 🛠 技术栈

- **框架**: Flask 2.3.3
- **数据库**: SQLite (开发) / PostgreSQL (生产推荐)
- **认证**: Flask-JWT-Extended
- **跨域**: Flask-CORS
- **ORM**: Flask-SQLAlchemy
- **容器化**: Docker
- **部署**: Docker Compose

## 📦 功能模块

### 1. 用户认证模块 (`/api/auth`)
- 微信小程序登录
- JWT Token管理
- 用户信息管理

### 2. 儿童管理模块 (`/api/child`)
- 儿童信息CRUD
- 成长记录管理
- 健康数据追踪

### 3. 内容管理模块 (`/api/content`)
- 育儿视频管理
- 育儿文章管理
- 内容搜索功能

### 4. 预约管理模块 (`/api/appointment`)
- 医疗预约创建
- 预约状态管理
- 预约历史查询

### 5. 聊天管理模块 (`/api/chat`)
- 在线咨询功能
- 消息历史记录
- 实时通信支持

## ⚡ 快速开始

### 前置要求

- Python 3.10+
- pip
- Git
- Docker (可选)

### 克隆项目

```bash
git clone <repository-url>
cd babysittingCareBackEnd
```

## 💻 本地开发

### 1. 创建虚拟环境

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 环境配置

创建 `.env` 文件（可选）：

```env
# 基础配置
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key

# 数据库配置
DATABASE_URL=sqlite:///database.db

# 微信小程序配置
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret

# 环境设置
FLASK_ENV=development
```

### 4. 启动开发服务器

```bash
python app.py
```

服务将在 `http://localhost:5010` 启动

### 5. 验证安装

访问以下端点验证服务正常运行：

- 健康检查: `GET http://localhost:5010/api/health`
- 服务状态: `GET http://localhost:5010/`

## 🐳 Docker部署

### 1. 构建Docker镜像

```bash
docker build -t babysitting-backend .
```

### 2. 运行容器

```bash
# 基础运行
docker run -p 5010:5000 babysitting-backend

# 带环境变量运行
docker run -p 5010:5000 \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e WECHAT_APP_ID=your-app-id \
  -e WECHAT_APP_SECRET=your-app-secret \
  babysitting-backend
```

### 3. 使用Docker Compose（推荐）

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5010:5000"
    environment:
      - SECRET_KEY=your-secret-key-here
      - JWT_SECRET_KEY=your-jwt-secret-key
      - WECHAT_APP_ID=your-wechat-app-id
      - WECHAT_APP_SECRET=your-wechat-app-secret
      - FLASK_ENV=production
    volumes:
      - ./instance:/app/instance
    restart: unless-stopped

  # 可选：添加数据库服务
  # postgres:
  #   image: postgres:13
  #   environment:
  #     POSTGRES_DB: babysitting
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: password
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

# volumes:
#   postgres_data:
```

启动服务：

```bash
docker-compose up -d
```

## 🌐 服务器部署

### 方案一：直接Docker部署

#### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 部署应用

```bash
# 创建项目目录
sudo mkdir -p /opt/babysitting
cd /opt/babysitting

# 上传项目文件（使用scp、git或其他方式）
# 例如：git clone <repository-url> .

# 构建并启动
sudo docker-compose up -d
```

#### 3. 配置反向代理（Nginx）

安装Nginx：

```bash
sudo apt install nginx -y
```

创建Nginx配置 `/etc/nginx/sites-available/babysitting`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    location / {
        proxy_pass http://localhost:5010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/babysitting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. 配置SSL（可选但推荐）

使用Let's Encrypt：

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 方案二：云服务部署

#### 阿里云ECS部署

1. **创建ECS实例**
   - 选择Ubuntu 20.04 LTS
   - 配置安全组开放80、443、5010端口

2. **部署步骤**
   ```bash
   # 连接服务器
   ssh root@your-server-ip
   
   # 按照方案一的步骤进行部署
   ```

#### 腾讯云轻量应用服务器部署

1. **创建实例**
   - 选择Docker应用镜像
   - 配置防火墙规则

2. **快速部署**
   ```bash
   # 直接运行容器
   docker run -d -p 5010:5000 \
     --name babysitting-backend \
     -e SECRET_KEY=your-secret \
     babysitting-backend
   ```

## 📚 API文档

详细的API文档请参考 `API测试指南.md` 文件，包含：

- 完整的接口列表
- 请求/响应示例
- 错误码说明
- 测试用例

### 主要接口概览

| 模块 | 接口 | 方法 | 描述 |
|------|------|------|------|
| 认证 | `/api/login` | POST | 微信登录 |
| 认证 | `/api/register` | POST | 用户注册 |
| 儿童 | `/api/addChild` | POST | 添加儿童 |
| 儿童 | `/api/getChildren` | GET | 获取儿童列表 |
| 内容 | `/api/getVideos` | GET | 获取视频列表 |
| 内容 | `/api/searchContent` | GET | 搜索内容 |
| 预约 | `/api/addAppointment` | POST | 创建预约 |
| 预约 | `/api/getAppointments` | GET | 获取预约列表 |
| 聊天 | `/api/sendMessage` | POST | 发送消息 |
| 聊天 | `/api/getChatHistory` | GET | 获取聊天历史 |

## ⚙️ 环境配置

### 开发环境

```env
FLASK_ENV=development
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret
DATABASE_URL=sqlite:///database.db
```

### 生产环境

```env
FLASK_ENV=production
SECRET_KEY=strong-random-secret-key
JWT_SECRET_KEY=strong-random-jwt-secret
DATABASE_URL=postgresql://user:password@localhost/babysitting
WECHAT_APP_ID=your-production-app-id
WECHAT_APP_SECRET=your-production-app-secret
```

### 安全配置建议

1. **密钥管理**
   - 使用强随机密钥
   - 定期轮换密钥
   - 不要在代码中硬编码密钥

2. **数据库安全**
   - 使用强密码
   - 限制数据库访问权限
   - 定期备份数据

3. **网络安全**
   - 使用HTTPS
   - 配置防火墙
   - 限制CORS域名

## ❓ 常见问题

### Q1: Docker构建失败

**问题**: `ERROR: failed to read dockerfile`

**解决**: 确保项目根目录有 `Dockerfile` 文件

```bash
# 检查文件是否存在
ls -la Dockerfile

# 如果使用自定义文件名
docker build -f backend.dockerfile -t babysitting-backend .
```

### Q2: 数据库连接失败

**问题**: SQLite数据库文件权限问题

**解决**: 确保instance目录有写权限

```bash
mkdir -p instance
chmod 755 instance
```

### Q3: 微信登录失败

**问题**: 微信API调用失败

**解决**: 检查微信小程序配置

1. 确认AppID和AppSecret正确
2. 检查微信小程序后台域名配置
3. 验证网络连接

### Q4: CORS跨域问题

**问题**: 前端无法访问API

**解决**: 检查CORS配置

```python
# config.py
CORS_ORIGINS = ['http://localhost:3000', 'https://your-domain.com']
```

### Q5: 端口占用

**问题**: 5010端口被占用

**解决**: 更换端口或停止占用进程

```bash
# 查看端口占用
netstat -ano | findstr :5010

# 停止进程
taskkill /PID <PID> /F

# 或使用其他端口
docker run -p 8001:5000 babysitting-backend
```

## 🔧 维护指南

### 日志管理

```bash
# 查看容器日志
docker logs babysitting-backend

# 实时查看日志
docker logs -f babysitting-backend

# 查看最近100行日志
docker logs --tail 100 babysitting-backend
```

### 数据备份

```bash
# SQLite备份
cp instance/database.db instance/database_backup_$(date +%Y%m%d).db

# PostgreSQL备份
pg_dump babysitting > backup_$(date +%Y%m%d).sql
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

### 性能监控

```bash
# 查看容器资源使用
docker stats babysitting-backend

# 查看系统资源
top
htop
```

### 安全更新

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新Python依赖
pip install --upgrade -r requirements.txt

# 重新构建Docker镜像
docker-compose build --no-cache
```

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 查看本文档的常见问题部分
2. 检查日志文件获取详细错误信息
3. 确认环境配置是否正确
4. 联系技术支持团队

## 📄 许可证

本项目采用 MIT 许可证，详情请参阅 LICENSE 文件。

---

**最后更新**: 2024年12月
**版本**: 1.0.0
**维护者**: 早护通开发团队