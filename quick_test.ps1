# 认证模块快速测试脚本
# 使用方法: .\quick_test.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  早护通 - 认证模块快速测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查后端服务
Write-Host "[1/5] 检查后端服务..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5010/api/health" -Method GET -ErrorAction Stop
    if ($health.status -eq "ok") {
        Write-Host "  ✅ 后端服务运行正常" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  后端服务状态异常" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ 后端服务未启动！" -ForegroundColor Red
    Write-Host "  请先运行: cd backend; python app.py" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 测试发送验证码
Write-Host "[2/5] 测试发送验证码..." -ForegroundColor Yellow
$testPhone = "13912345678"
try {
    $codeResponse = Invoke-RestMethod -Uri "http://localhost:5010/api/auth/phone/code" `
        -Method POST `
        -Body (@{phone=$testPhone} | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    if ($codeResponse.status -eq "success" -and $codeResponse.data.code) {
        $verificationCode = $codeResponse.data.code
        Write-Host "  ✅ 验证码发送成功" -ForegroundColor Green
        Write-Host "  📱 手机号: $testPhone" -ForegroundColor Cyan
        Write-Host "  🔑 验证码: $verificationCode" -ForegroundColor Cyan
    } else {
        Write-Host "  ❌ 验证码发送失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ 验证码接口调用失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 测试无效验证码
Write-Host "[3/5] 测试无效验证码拦截..." -ForegroundColor Yellow
try {
    $invalidLogin = Invoke-RestMethod -Uri "http://localhost:5010/api/auth/phone/login" `
        -Method POST `
        -Body (@{phone=$testPhone; code="000000"} | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  ⚠️  无效验证码未被拦截（不应该发生）" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✅ 无效验证码正确拦截" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  异常错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# 测试登录
Write-Host "[4/5] 测试验证码登录..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5010/api/auth/phone/login" `
        -Method POST `
        -Body (@{phone=$testPhone; code=$verificationCode} | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    if ($loginResponse.status -eq "success" -and $loginResponse.data.token) {
        $token = $loginResponse.data.token
        $userId = $loginResponse.data.user.id
        Write-Host "  ✅ 登录成功" -ForegroundColor Green
        Write-Host "  👤 用户ID: $userId" -ForegroundColor Cyan
        Write-Host "  🎫 Token: $($token.Substring(0, 30))..." -ForegroundColor Cyan
    } else {
        Write-Host "  ❌ 登录失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ 登录接口调用失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 测试无效手机号
Write-Host "[5/5] 测试无效手机号拦截..." -ForegroundColor Yellow
try {
    $invalidPhone = Invoke-RestMethod -Uri "http://localhost:5010/api/auth/phone/code" `
        -Method POST `
        -Body (@{phone="12345"} | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  ⚠️  无效手机号未被拦截（不应该发生）" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✅ 无效手机号正确拦截" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  异常错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 所有测试通过！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步测试前端应用:" -ForegroundColor Yellow
Write-Host "  1. cd WA" -ForegroundColor White
Write-Host "  2. npx expo start" -ForegroundColor White
Write-Host "  3. 按 'w' 在浏览器中打开" -ForegroundColor White
Write-Host ""
Write-Host "详细测试指南请查看: AUTH_TEST_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
