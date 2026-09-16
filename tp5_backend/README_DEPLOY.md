# 网巢 AI角色社交APP - ThinkPHP 5.0 + MySQL 5.6 后端部署指南

## 1. 运行环境推荐
- **PHP版本**: PHP 5.6.x (最低支持 PHP 5.6，亦兼容 PHP 7.x)
- **MySQL版本**: MySQL 5.6.x (默认推荐，兼容 MariaDB 10.0+)
- **Web服务器**: Nginx 1.18+ 或 Apache 2.4+
- **框架版本**: ThinkPHP 5.0.24 LTS

---

## 2. 数据库安装 (MySQL 5.6)
1. 登录 MySQL 数据库：
   ```bash
   mysql -u root -p
   ```
2. 创建数据库 `wangchao_db`，字符集选用 `utf8mb4`：
   ```sql
   CREATE DATABASE `wangchao_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 导入本目录下初始数据脚本：
   ```bash
   mysql -u root -p wangchao_db < database_mysql5.6.sql
   ```

---

## 3. 配置文件修改
打开 `application/database.php`，修改数据库连接参数：
```php
'hostname' => '127.0.0.1',
'database' => 'wangchao_db',
'username' => '你的数据库账号',
'password' => '你的数据库密码',
'hostport' => '3306',
'charset'  => 'utf8mb4',
'prefix'   => 'fa_',
```

---

## 4. Web 服务器伪静态配置 (URL Rewrite)

### Nginx 伪静态配置
在 Nginx `server` 配置段内添加：
```nginx
location / {
    if (!-e $request_filename) {
        rewrite ^(.*)$ /index.php?s=$1 last;
        break;
    }
}
```

### Apache 伪静态配置 (.htaccess)
项目根目录下的 `.htaccess`：
```apache
<IfModule mod_rewrite.c>
  Options +FollowSymlinks -Multiviews
  RewriteEngine On

  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]
</IfModule>
```

---

## 5. API 接口一览 (RESTful)
| 接口地址 | 请求方式 | 说明 |
| :--- | :--- | :--- |
| `/api/v1/user/login` | POST | 用户登录认证 |
| `/api/v1/user/register` | POST | 新用户注册 |
| `/api/v1/user/profile` | GET | 用户资料与统计 |
| `/api/v1/role/list` | GET | 角色列表(分类/搜索) |
| `/api/v1/role/detail/:id` | GET | 角色详细档案 |
| `/api/v1/role/follow` | POST | 关注/取消关注角色 |
| `/api/v1/role/create` | POST | 用户自创角色上架 |
| `/api/v1/chat/send` | POST | 发送聊天消息并返回角色回复 |
| `/api/v1/chat/history/:role_id` | GET | 获取聊天历史 |
| `/api/v1/conversation/list` | GET | 获取会话列表 |
| `/api/v1/wallet/info` | GET | 钱包明细与余额 |
| `/api/v1/wallet/recharge` | POST | 钱包充值模拟 |
