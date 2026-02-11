# 使用 Python 3.11 官方镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=app.py \
    FLASK_ENV=production

# 可按需在构建时覆盖：
# docker build --build-arg APT_MIRROR=https://mirrors.ustc.edu.cn/debian \
#              --build-arg APT_SECURITY_MIRROR=https://mirrors.ustc.edu.cn/debian-security .
ARG APT_MIRROR=https://mirrors.tuna.tsinghua.edu.cn/debian
ARG APT_SECURITY_MIRROR=https://mirrors.tuna.tsinghua.edu.cn/debian-security

# 安装系统依赖和 uv
RUN set -eux; \
    if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
      sed -i "s|http://deb.debian.org/debian|${APT_MIRROR}|g; s|https://deb.debian.org/debian|${APT_MIRROR}|g; s|http://security.debian.org/debian-security|${APT_SECURITY_MIRROR}|g; s|https://security.debian.org/debian-security|${APT_SECURITY_MIRROR}|g" /etc/apt/sources.list.d/debian.sources; \
    elif [ -f /etc/apt/sources.list ]; then \
      sed -i "s|http://deb.debian.org/debian|${APT_MIRROR}|g; s|https://deb.debian.org/debian|${APT_MIRROR}|g; s|http://security.debian.org/debian-security|${APT_SECURITY_MIRROR}|g; s|https://security.debian.org/debian-security|${APT_SECURITY_MIRROR}|g" /etc/apt/sources.list; \
    fi; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir uv

# 复制依赖文件并安装（利用缓存层）
COPY pyproject.toml uv.lock ./

# 使用 uv 安装依赖
RUN uv sync --frozen --no-dev

# 复制应用代码
COPY . .

# 确保应用目录对非 root 用户可写
RUN chown -R nobody:nobody /app

# 切换到非 root 用户
USER nobody

# 暴露端口
EXPOSE 5000

# 启动命令（使用 uv run）
CMD ["uv", "run", "python", "app.py"]
