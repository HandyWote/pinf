# 早护通微信小程序后端API文档

## 基础信息
- **域名**：backend.pinf.top
- **服务器公网IP**：8.138.224.38
- **API基础路径**：/api
- **认证方式**：JWT Token

## 错误码说明
- **200**：请求成功
- **400**：请求参数错误
- **401**：未授权或token无效
- **404**：资源不存在
- **500**：服务器内部错误

## 认证说明
除登录接口外，所有接口都需要在请求头中携带JWT Token：
```
Authorization: Bearer <token>
```

---

## 接口列表

### 1. 用户认证模块

#### 1.1 微信登录
- **接口URL**：`/api/login`
- **请求方式**：POST
- **接口描述**：使用微信临时登录凭证进行用户登录
- **是否需要认证**：否

**请求参数**
| 参数名 | 类型   | 必须 | 说明               |
|--------|--------|------|--------------------||
| code   | string | 是   | 微信登录临时凭证   |

**响应数据**
```json
{
  "success": true,
  "userinfo": {
    "openid": "用户唯一标识",
    "role": "user",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "role": "user",
  "openid": "用户唯一标识",
  "session_key": "会话密钥",
  "childinfo": [],
  "token": "JWT认证令牌"
}
```

#### 1.2 测试登录（开发环境）
- **接口URL**：`/api/test-login`
- **请求方式**：POST
- **接口描述**：测试登录接口，仅用于开发测试
- **是否需要认证**：否

**请求参数**
| 参数名 | 类型   | 必须 | 说明               |
|--------|--------|------|--------------------||
| openid | string | 是   | 测试用户标识       |

**响应数据**
```json
{
  "success": true,
  "userinfo": {
    "openid": "test_user_123",
    "role": "user",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "role": "user",
  "openid": "test_user_123",
  "session_key": "test_session_key",
  "childinfo": [],
  "token": "JWT认证令牌"
}
```

---

### 2. 儿童管理模块

#### 2.1 获取儿童信息
- **接口URL**：`/api/getChildInfo`
- **请求方式**：GET
- **接口描述**：获取当前用户的所有儿童信息
- **是否需要认证**：是

**请求参数**
无需额外参数，通过Token获取用户信息

**响应数据**
```json
{
  "success": true,
  "childinfo": [
    {
      "id": 1,
      "name": "宝宝姓名",
      "birthDate": "2023-01-01",
      "gender": "男",
      "gestationalAge": 40,
      "growthRecords": [
        {
          "id": 1,
          "date": "2023-06-01",
          "ageInMonths": 5,
          "ageInWeeks": 22,
          "height": 65.5,
          "weight": 7.2,
          "headCircumference": 42.0
        }
      ]
    }
  ]
}
```

#### 2.2 添加儿童信息
- **接口URL**：`/api/addChild`
- **请求方式**：POST
- **接口描述**：添加新的儿童信息
- **是否需要认证**：是

**请求参数**
| 参数名         | 类型   | 必须 | 说明                          |
|----------------|--------|------|-------------------------------|
| name           | string | 是   | 宝宝姓名                      |
| birthDate      | string | 是   | 出生日期，格式：YYYY-MM-DD    |
| gender         | string | 是   | 性别，"男" 或 "女"           |
| gestationalAge | number | 是   | 孕周                          |

**响应数据**
```json
{
  "success": true,
  "message": "儿童信息添加成功",
  "childInfo": {
    "id": 1,
    "name": "宝宝姓名",
    "birthDate": "2023-01-01",
    "gender": "男",
    "gestationalAge": 40,
    "growthRecords": []
  }
}
```

#### 2.3 添加生长记录
- **接口URL**：`/api/addGrowthRecord`
- **请求方式**：POST
- **接口描述**：为指定儿童添加生长记录
- **是否需要认证**：是

**请求参数**
| 参数名            | 类型   | 必须 | 说明                          |
|-------------------|--------|------|-------------------------------|
| childId           | number | 是   | 儿童ID                        |
| date              | string | 是   | 记录日期，格式：YYYY-MM-DD    |
| ageInMonths       | number | 是   | 月龄                          |
| ageInWeeks        | number | 是   | 周龄                          |
| height            | number | 是   | 身高(cm)                      |
| weight            | number | 是   | 体重(kg)                      |
| headCircumference | number | 是   | 头围(cm)                      |

**响应数据**
```json
{
  "success": true,
  "message": "生长记录添加成功",
  "growthRecord": {
    "id": 1,
    "date": "2023-06-01",
    "ageInMonths": 5,
    "ageInWeeks": 22,
    "height": 65.5,
    "weight": 7.2,
    "headCircumference": 42.0
  }
}
```

---

### 3. 内容管理模块

#### 3.1 获取视频列表
- **接口URL**：`/api/getVideos`
- **请求方式**：GET
- **接口描述**：获取视频列表，支持分页和搜索
- **是否需要认证**：是

**请求参数**
| 参数名   | 类型   | 必须 | 默认值 | 说明           |
|----------|--------|------|--------|----------------|
| page     | number | 否   | 1      | 页码           |
| per_page | number | 否   | 10     | 每页数量       |
| search   | string | 否   | ""     | 搜索关键词     |

**响应数据**
```json
{
  "success": true,
  "videos": [
    {
      "id": 1,
      "title": "视频标题",
      "description": "视频描述",
      "videoUrl": "视频URL",
      "coverUrl": "封面图URL",
      "views": 100,
      "publishDate": "2024-01-01",
      "tags": ["标签1", "标签2"]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 50,
    "pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

#### 3.2 获取视频详情
- **接口URL**：`/api/getVideoDetail/<video_id>`
- **请求方式**：GET
- **接口描述**：获取指定视频的详细信息
- **是否需要认证**：是

**路径参数**
| 参数名   | 类型   | 必须 | 说明   |
|----------|--------|------|--------|
| video_id | number | 是   | 视频ID |

**响应数据**
```json
{
  "success": true,
  "video": {
    "id": 1,
    "title": "视频标题",
    "description": "视频描述",
    "videoUrl": "视频URL",
    "coverUrl": "封面图URL",
    "views": 101,
    "publishDate": "2024-01-01",
    "tags": ["标签1", "标签2"]
  }
}
```

#### 3.3 获取文章列表
- **接口URL**：`/api/getArticles`
- **请求方式**：GET
- **接口描述**：获取文章列表，支持分页和搜索
- **是否需要认证**：是

**请求参数**
| 参数名   | 类型   | 必须 | 默认值 | 说明           |
|----------|--------|------|--------|----------------|
| page     | number | 否   | 1      | 页码           |
| per_page | number | 否   | 10     | 每页数量       |
| search   | string | 否   | ""     | 搜索关键词     |

**响应数据**
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "文章标题",
      "content": "文章内容(HTML格式)",
      "coverUrl": "封面图URL",
      "author": "作者",
      "publishDate": "2024-01-01",
      "tags": ["标签1", "标签2"]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 30,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

#### 3.4 获取文章详情
- **接口URL**：`/api/getArticleDetail/<article_id>`
- **请求方式**：GET
- **接口描述**：获取指定文章的详细信息
- **是否需要认证**：是

**路径参数**
| 参数名     | 类型   | 必须 | 说明   |
|------------|--------|------|--------|
| article_id | number | 是   | 文章ID |

**响应数据**
```json
{
  "success": true,
  "article": {
    "id": 1,
    "title": "文章标题",
    "content": "文章内容(HTML格式)",
    "coverUrl": "封面图URL",
    "author": "作者",
    "publishDate": "2024-01-01",
    "tags": ["标签1", "标签2"]
  }
}
```

#### 3.5 搜索内容
- **接口URL**：`/api/searchContent`
- **请求方式**：GET
- **接口描述**：搜索视频和文章内容
- **是否需要认证**：是

**请求参数**
| 参数名   | 类型   | 必须 | 默认值 | 说明                           |
|----------|--------|------|--------|--------------------------------|
| keyword  | string | 是   | -      | 搜索关键词                     |
| type     | string | 否   | "all"  | 内容类型：all/video/article    |
| page     | number | 否   | 1      | 页码                           |
| per_page | number | 否   | 10     | 每页数量                       |

**响应数据**
```json
{
  "success": true,
  "videos": [],
  "articles": [],
  "total": 0,
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 0,
    "pages": 0,
    "has_next": false,
    "has_prev": false
  }
}
```

---

### 4. 预约管理模块

#### 4.1 获取预约列表
- **接口URL**：`/api/getAppointments`
- **请求方式**：GET
- **接口描述**：获取用户的预约列表
- **是否需要认证**：是

**请求参数**
| 参数名   | 类型   | 必须 | 默认值 | 说明                           |
|----------|--------|------|--------|--------------------------------|
| status   | string | 否   | "all"  | 状态筛选：all/pending/completed|
| page     | number | 否   | 1      | 页码                           |
| per_page | number | 否   | 10     | 每页数量                       |

**响应数据**
```json
{
  "success": true,
  "appointments": [
    {
      "id": "appointment_id",
      "hospitalName": "医院名称",
      "department": "科室名称",
      "appointmentDate": "2024-01-15",
      "reminderDays": 1,
      "notes": "备注信息",
      "status": "pending",
      "childInfo": {
        "id": 1,
        "name": "宝宝姓名",
        "birthDate": "2023-01-01"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 5,
    "pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

#### 4.2 添加预约
- **接口URL**：`/api/addAppointment`
- **请求方式**：POST
- **接口描述**：创建新的预约记录
- **是否需要认证**：是

**请求参数**
| 参数名          | 类型   | 必须 | 说明                          |
|-----------------|--------|------|-------------------------------|
| childId         | number | 是   | 儿童ID                        |
| hospitalName    | string | 是   | 医院名称                      |
| department      | string | 是   | 科室名称                      |
| appointmentDate | string | 是   | 预约日期，格式：YYYY-MM-DD    |
| reminderDays    | number | 否   | 提前提醒天数，默认1天         |
| notes           | string | 否   | 备注信息                      |

**响应数据**
```json
{
  "success": true,
  "message": "预约创建成功",
  "appointment": {
    "id": "generated_appointment_id",
    "hospitalName": "医院名称",
    "department": "科室名称",
    "appointmentDate": "2024-01-15",
    "reminderDays": 1,
    "notes": "备注信息",
    "status": "pending"
  }
}
```

---

### 5. 聊天管理模块

#### 5.1 发送消息
- **接口URL**：`/api/sendMessage`
- **请求方式**：POST
- **接口描述**：发送聊天消息并获取AI回复
- **是否需要认证**：是

**请求参数**
| 参数名    | 类型   | 必须 | 说明           |
|-----------|--------|------|----------------|
| content   | string | 是   | 消息内容       |
| messageId | string | 是   | 前端生成的消息ID|

**响应数据**
```json
{
  "success": true,
  "message": "消息发送成功",
  "userMessage": {
    "id": "user_message_id",
    "type": "user",
    "content": "用户消息内容",
    "time": 1704067200000,
    "status": "sent"
  },
  "aiMessage": {
    "id": "ai_message_id",
    "type": "ai",
    "content": "AI回复内容",
    "time": 1704067201000,
    "status": "sent"
  }
}
```

#### 5.2 获取聊天历史
- **接口URL**：`/api/getChatHistory`
- **请求方式**：GET
- **接口描述**：获取用户的聊天历史记录
- **是否需要认证**：是

**请求参数**
| 参数名   | 类型   | 必须 | 默认值 | 说明     |
|----------|--------|------|--------|----------|
| page     | number | 否   | 1      | 页码     |
| per_page | number | 否   | 50     | 每页数量 |

**响应数据**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message_id",
      "type": "user",
      "content": "消息内容",
      "time": 1704067200000,
      "status": "sent"
    },
    {
      "id": "ai_message_id",
      "type": "ai",
      "content": "AI回复内容",
      "time": 1704067201000,
      "status": "sent"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 100,
    "pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

#### 5.3 清空聊天历史
- **接口URL**：`/api/clearChatHistory`
- **请求方式**：DELETE
- **接口描述**：清空用户的所有聊天记录
- **是否需要认证**：是

**请求参数**
无

**响应数据**
```json
{
  "success": true,
  "message": "聊天历史已清空"
}
```

---

## 数据模型说明

### 用户模型 (User)
```json
{
  "openid": "string",
  "role": "user|doctor",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 儿童模型 (Child)
```json
{
  "id": "number",
  "name": "string",
  "birthDate": "date",
  "gender": "男|女",
  "gestationalAge": "number",
  "growthRecords": "array"
}
```

### 生长记录模型 (GrowthRecord)
```json
{
  "id": "number",
  "date": "date",
  "ageInMonths": "number",
  "ageInWeeks": "number",
  "height": "number",
  "weight": "number",
  "headCircumference": "number"
}
```

### 视频模型 (Video)
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "videoUrl": "string",
  "coverUrl": "string",
  "views": "number",
  "publishDate": "date",
  "tags": "array"
}
```

### 文章模型 (Article)
```json
{
  "id": "number",
  "title": "string",
  "content": "string",
  "coverUrl": "string",
  "author": "string",
  "publishDate": "date",
  "tags": "array"
}
```

### 预约模型 (Appointment)
```json
{
  "id": "string",
  "hospitalName": "string",
  "department": "string",
  "appointmentDate": "date",
  "reminderDays": "number",
  "notes": "string",
  "status": "pending|completed"
}
```

### 聊天消息模型 (ChatMessage)
```json
{
  "id": "string",
  "type": "user|ai",
  "content": "string",
  "time": "timestamp",
  "status": "sent|failed"
}
```

---

## 错误响应格式

所有错误响应都遵循以下格式：
```json
{
  "success": false,
  "message": "错误描述信息"
}
```

## 分页响应格式

包含分页的响应都会包含pagination字段：
```json
{
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 100,
    "pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

## 开发环境配置

### 微信小程序配置
- **AppID**: `wxae8e4d15e58a0178`
- **AppSecret**: `1344bb4c86e9cdbbdbe4088e15847eec`

### 服务器配置
- **本地开发**: `http://localhost:5000`
- **生产环境**: `https://backend.pinf.top`

### 健康检查
- **接口URL**: `/api/health`
- **请求方式**: GET
- **响应**: `{"status": "healthy", "message": "API服务正常"}`

