import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Database, FileCode, Server, Download } from 'lucide-react';

interface Tp5DevModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const Tp5DevModal: React.FC<Tp5DevModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'controller' | 'config' | 'deploy'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 网巢 (Wangchao) AI角色社交APP - MySQL 5.6 数据库完整建表脚本
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 用户表 (fa_user)
DROP TABLE IF EXISTS \`fa_user\`;
CREATE TABLE \`fa_user\` (
  \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL DEFAULT '' COMMENT '用户名/手机号',
  \`password\` varchar(64) NOT NULL DEFAULT '' COMMENT '加密密码',
  \`salt\` varchar(16) NOT NULL DEFAULT '',
  \`nickname\` varchar(50) NOT NULL DEFAULT '网巢用户',
  \`avatar\` varchar(255) NOT NULL DEFAULT '😊',
  \`money\` decimal(10,2) NOT NULL DEFAULT '128.50',
  \`score\` int(11) NOT NULL DEFAULT '328',
  \`vip_level\` tinyint(1) NOT NULL DEFAULT '1',
  \`vip_expire_time\` int(11) NOT NULL DEFAULT '1798732800',
  \`status\` tinyint(1) NOT NULL DEFAULT '1',
  \`create_time\` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_username\` (\`username\`)
) ENGINE=InnoDB AUTO_INCREMENT=10087 DEFAULT CHARSET=utf8mb4;

-- 2. 角色表 (fa_role)
DROP TABLE IF EXISTS \`fa_role\`;
CREATE TABLE \`fa_role\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(50) NOT NULL,
  \`title\` varchar(50) NOT NULL,
  \`emoji\` varchar(20) NOT NULL DEFAULT '🤖',
  \`cover_class\` varchar(50) NOT NULL DEFAULT 'c-domineering',
  \`desc\` text NOT NULL,
  \`tags\` varchar(255) NOT NULL DEFAULT '',
  \`topics\` text,
  \`users_count\` varchar(20) NOT NULL DEFAULT '10.0k',
  \`follows_count\` varchar(20) NOT NULL DEFAULT '3.0k',
  \`rating\` decimal(2,1) NOT NULL DEFAULT '4.8',
  \`is_official\` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 聊天消息表 (fa_chat_message)
DROP TABLE IF EXISTS \`fa_chat_message\`;
CREATE TABLE \`fa_chat_message\` (
  \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  \`user_id\` int(11) unsigned NOT NULL,
  \`role_id\` varchar(50) NOT NULL,
  \`sender_type\` enum('user','role') NOT NULL DEFAULT 'user',
  \`content\` text NOT NULL,
  \`create_time\` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`),
  KEY \`idx_user_role\` (\`user_id\`,\`role_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 关注表 (fa_user_follow) 与 会话表 (fa_conversation)
-- 详细代码已保存在项目 /tp5_backend/database_mysql5.6.sql 中
`;

  const controllerCode = `<?php
namespace app\\api\\controller;

use think\\Db;

/**
 * 网巢 AI角色交互控制器 - ThinkPHP 5.0 (PHP 5.6)
 */
class Chat extends Base
{
    public function send()
    {
        $roleId = trim($this->request->post('role_id', ''));
        $content = trim($this->request->post('content', ''));

        if (empty($roleId) || empty($content)) {
            return $this->error('参数缺失');
        }

        $now = time();
        // 1. 写入用户消息到 MySQL 5.6
        Db::name('chat_message')->insert([
            'user_id'     => $this->userId,
            'role_id'     => $roleId,
            'sender_type' => 'user',
            'content'     => $content,
            'create_time' => $now
        ]);

        // 2. 生成对应角色人格拟真回复
        $reply = $this->generateRoleReply($roleId, $content);

        // 3. 写入角色回复消息
        Db::name('chat_message')->insert([
            'user_id'     => $this->userId,
            'role_id'     => $roleId,
            'sender_type' => 'role',
            'content'     => $reply,
            'create_time' => $now + 1
        ]);

        return $this->success('发送成功', [
            'reply' => $reply,
            'time'  => date('H:i', $now)
        ]);
    }
}`;

  const configCode = `<?php
// ThinkPHP 5.0 database.php (兼容 PHP 5.6 + MySQL 5.6)
return [
    'type'            => 'mysql',
    'hostname'        => '127.0.0.1',
    'database'        => 'wangchao_db',
    'username'        => 'wangchao',
    'password'        => 'wangchao_pwd',
    'hostport'        => '3306',
    'charset'         => 'utf8mb4',
    'prefix'          => 'fa_',
    'params'          => [
        \\PDO::ATTR_CASE => \\PDO::CASE_NATURAL,
        \\PDO::ATTR_ERRMODE => \\PDO::ERRMODE_EXCEPTION,
    ],
];
`;

  const deployCode = `# 网巢 (Wangchao) ThinkPHP 5.0 + MySQL 5.6 部署指南

## 1. 运行环境配置 (推荐宝塔面板 / LAMP / LNMP)
- PHP版本: PHP 5.6 (支持 5.6.x 到 7.4.x)
- MySQL版本: MySQL 5.6.x
- Nginx / Apache: 任意现代版本

## 2. 数据库快速导入
1. 创建数据库: wangchao_db (字符集: utf8mb4)
2. 导入本工程自带的 SQL 文件:
   mysql -u wangchao -p wangchao_db < /tp5_backend/database_mysql5.6.sql

## 3. Nginx 伪静态 (URL Rewrite)
location / {
    if (!-e $request_filename) {
        rewrite ^(.*)$ /index.php?s=$1 last;
        break;
    }
}
`;

  const getCurrentSnippet = () => {
    switch (activeTab) {
      case 'sql':
        return sqlCode;
      case 'controller':
        return controllerCode;
      case 'config':
        return configCode;
      case 'deploy':
        return deployCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentSnippet());
    setCopied(true);
    onShowToast('后端代码已复制到剪贴板！');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([getCurrentSnippet()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download =
      activeTab === 'sql'
        ? 'database_mysql5.6.sql'
        : activeTab === 'controller'
        ? 'Chat.php'
        : activeTab === 'config'
        ? 'database.php'
        : 'DEPLOY.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onShowToast('文件导出成功');
  };

  return (
    <div
      id="tp5-dev-modal"
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-[#0e0e17] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Server size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>ThinkPHP 5.0 + MySQL 5.6 后端架构中心</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                  PHP 5.6
                </span>
              </h3>
              <p className="text-[11px] text-white/40">已打包完备的TP5控制器、RESTful路由与MySQL 5.6数据表</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-black/40 px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-2 rounded-t-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'sql'
                ? 'bg-[#151522] text-purple-300 border-t-2 border-purple-500 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Database size={13} />
            <span>MySQL 5.6 建表 (SQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('controller')}
            className={`px-3 py-2 rounded-t-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'controller'
                ? 'bg-[#151522] text-purple-300 border-t-2 border-purple-500 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FileCode size={13} />
            <span>TP5 控制器 (Chat.php)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 rounded-t-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'config'
                ? 'bg-[#151522] text-purple-300 border-t-2 border-purple-500 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Terminal size={13} />
            <span>数据库配置 (database.php)</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-2 rounded-t-lg text-xs font-medium flex items-center gap-1.5 transition ${
              activeTab === 'deploy'
                ? 'bg-[#151522] text-purple-300 border-t-2 border-purple-500 font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Server size={13} />
            <span>部署说明 (README)</span>
          </button>
        </div>

        {/* Code View Area */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-white/80 bg-[#07070b] select-text leading-relaxed">
          <pre className="whitespace-pre-wrap">{getCurrentSnippet()}</pre>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] text-white/40">文件物理路径: /tp5_backend/</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Download size={13} />
              <span>导出文件</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? '已复制' : '复制源码'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
