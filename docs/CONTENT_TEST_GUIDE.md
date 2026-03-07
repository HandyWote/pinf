# 内容课堂接口测试文档（手动）

> **前端状态**: 内容课堂模块已完成集成，包括列表页、搜索、分类筛选、视频/文章详情页。前端文件位于 `app_end/app/(tabs)/class.tsx`、`app_end/app/class-video/[id].tsx`、`app_end/app/class-article/[id].tsx`。

## 1. 基础信息
- Base URL: `http://localhost:5010/api`
- 认证方式：JWT Bearer Token
- Header 示例：
```
Authorization: Bearer <token>
Content-Type: application/json
```

## 1.1 可选：开启本地内容种子数据（用于联调）
默认列表为空。如需看到推荐卡片并验证跳转，可在启动后端前设置：
```powershell
$env:CONTENT_SEED="1"
```
仅本地生效，未设置时保持空数据。

## 2. 获取 Token（前置）
先通过手机号登录获取 `token`，参考 `docx/AUTH_TEST_GUIDE.md`。

## 3. 接口列表

### 3.1 获取视频列表
**GET** `/content/videos`

**Query 参数**
- `page`：页码，默认 1
- `per_page`：每页数量，默认 10（最大 50）
- `search`：搜索关键字（标题/简介）
- `category`：分类

**请求示例（PowerShell）**
```powershell
$token = "<你的JWT>"
Invoke-RestMethod -Uri "http://localhost:5010/api/content/videos?page=1&per_page=10" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Method GET
```

**成功响应**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "早产儿喂养关键点",
      "description": "......",
      "videoUrl": "https://...",
      "coverUrl": "https://...",
      "category": "喂养",
      "views": 0,
      "publishDate": "2025-12-20",
      "tags": ["喂养"]
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 0,
    "pages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**空数据预期**
- `data` 为空数组
- `pagination.total` 为 0

---

### 3.2 获取视频详情（会增加 view 计数）
**GET** `/content/videos/{id}`

**请求示例**
```powershell
Invoke-RestMethod -Uri "http://localhost:5010/api/content/videos/1" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Method GET
```

**成功响应**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "早产儿喂养关键点",
    "description": "......",
    "videoUrl": "https://...",
    "coverUrl": "https://...",
    "category": "喂养",
    "views": 1,
    "publishDate": "2025-12-20",
    "tags": ["喂养"]
  }
}
```

**错误响应（不存在）**
- HTTP 404
```json
{
  "status": "error",
  "message": "视频不存在"
}
```

---

### 3.3 获取文章列表
**GET** `/content/articles`

**Query 参数**
- `page`：页码，默认 1
- `per_page`：每页数量，默认 10（最大 50）
- `search`：搜索关键字（标题/正文）
- `category`：分类

**请求示例**
```powershell
Invoke-RestMethod -Uri "http://localhost:5010/api/content/articles?page=1&per_page=10" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Method GET
```

**成功响应**
```json
{
  "status": "success",
  "data": [
    {
      "id": 10,
      "title": "早产儿出院后如何科学喂养？",
      "content": "......",
      "coverUrl": "https://...",
      "author": "张医生",
      "category": "喂养",
      "publishDate": "2025-12-18",
      "tags": ["喂养"]
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 10,
    "total": 0,
    "pages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 3.4 获取文章详情
**GET** `/content/articles/{id}`

**请求示例**
```powershell
Invoke-RestMethod -Uri "http://localhost:5010/api/content/articles/10" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Method GET
```

**成功响应**
```json
{
  "status": "success",
  "data": {
    "id": 10,
    "title": "早产儿出院后如何科学喂养？",
    "content": "......",
    "coverUrl": "https://...",
    "author": "张医生",
    "category": "喂养",
    "publishDate": "2025-12-18",
    "tags": ["喂养"]
  }
}
```

**错误响应（不存在）**
- HTTP 404
```json
{
  "status": "error",
  "message": "文章不存在"
}
```

---

## 4. 认证错误示例
当未携带 token 或 token 失效时：
```json
{
  "status": "error",
  "message": "认证失败: ..."
}
```

## 5. 备注
- 当前数据源为空，列表接口返回空数组属于预期。
- 详情接口需有对应 id 的数据，否则返回 404。
