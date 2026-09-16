-- =========================================================
-- 网巢 (Wangchao) AI角色社交APP - MySQL 5.6 数据库建表脚本
-- 适用环境: MySQL 5.6.x+ / MariaDB 10.0+
-- 字符集: utf8mb4 / 排序规则: utf8mb4_unicode_ci
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 用户表 (fa_user)
-- ----------------------------
DROP TABLE IF EXISTS `fa_user`;
CREATE TABLE `fa_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) NOT NULL DEFAULT '' COMMENT '用户名/手机号',
  `password` varchar(64) NOT NULL DEFAULT '' COMMENT '加密密码(md5+salt)',
  `salt` varchar(16) NOT NULL DEFAULT '' COMMENT '密码盐',
  `nickname` varchar(50) NOT NULL DEFAULT '网巢用户' COMMENT '昵称',
  `avatar` varchar(255) NOT NULL DEFAULT '😊' COMMENT '头像Emoji或图片URL',
  `money` decimal(10,2) NOT NULL DEFAULT '128.50' COMMENT '账户余额',
  `score` int(11) NOT NULL DEFAULT '328' COMMENT '用户积分',
  `vip_level` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0:普通用户, 1:黄金会员, 2:钻石会员',
  `vip_expire_time` int(11) NOT NULL DEFAULT '1798732800' COMMENT 'VIP到期时间戳',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:1正常,0禁用',
  `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '注册时间',
  `update_time` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10087 DEFAULT CHARSET=utf8mb4 COMMENT='用户基础表';

-- 初始管理员/测试用户 (密码: 123456)
INSERT INTO `fa_user` (`id`, `username`, `password`, `salt`, `nickname`, `avatar`, `money`, `score`, `vip_level`, `vip_expire_time`, `create_time`)
VALUES (10086, 'admin', 'e10adc3949ba59abbe56e057f20f883e', 'w7x9', '网巢体验官', '😊', 128.50, 328, 1, 1798732800, UNIX_TIMESTAMP());

-- ----------------------------
-- 2. 角色表 (fa_role)
-- ----------------------------
DROP TABLE IF EXISTS `fa_role`;
CREATE TABLE `fa_role` (
  `id` varchar(50) NOT NULL COMMENT '角色唯一标识key',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `title` varchar(50) NOT NULL COMMENT '角色标签/头衔',
  `emoji` varchar(20) NOT NULL DEFAULT '🤖' COMMENT '角色Emoji/头像',
  `cover_class` varchar(50) NOT NULL DEFAULT 'c-domineering' COMMENT '前端渐变背景类',
  `desc` text NOT NULL COMMENT '角色自白与设定描述',
  `personality` text COMMENT 'AI深度人设Prompt提示词',
  `tags` varchar(255) NOT NULL DEFAULT '' COMMENT '标签(逗号分隔)',
  `topics` text COMMENT '开场白备选话题(JSON格式)',
  `users_count` varchar(20) NOT NULL DEFAULT '10.0k' COMMENT '对话人数展示',
  `follows_count` varchar(20) NOT NULL DEFAULT '3.0k' COMMENT '关注人数展示',
  `rating` decimal(2,1) NOT NULL DEFAULT '4.8' COMMENT '评分',
  `is_official` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1官方角色,0用户自创',
  `creator_id` int(11) NOT NULL DEFAULT '0' COMMENT '创建者用户ID',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:1启用,0下架',
  `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI角色元数据表';

-- 预置11位官方角色
INSERT INTO `fa_role` (`id`, `name`, `title`, `emoji`, `cover_class`, `desc`, `tags`, `topics`, `users_count`, `follows_count`, `rating`, `create_time`) VALUES
('lujingchen', '陆景琛', '霸道总裁', '🤵', 'c-domineering', '高冷强势，说一不二。对全世界冷脸，唯独对你例外。商界提起我没人敢大声说话——不过这不重要，重要的是你今晚吃饭了没？', '霸总,霸道,总裁,宠溺', '["你今天怎么这么晚才回消息？","晚上有空吗？陪我吃饭。","女人，你成功引起了我的注意。"]', '28.6k', '8.9k', 4.9, UNIX_TIMESTAMP()),
('linmubai', '林慕白', '温柔学长', '👨‍🎓', 'c-warm-senpai', '温柔可靠，话不多但句句靠得住。刚把社团的东西搬完，正靠着栏杆喝东西。看到你来了，把手里另一瓶水递过去。', '温柔,学长,治愈', '["最近学习压力大吗？","早点休息，别熬夜了。","有什么不懂的随时问我。"]', '18.2k', '5.6k', 4.8, UNIX_TIMESTAMP()),
('gubeichen', '顾北辰', '邻家哥哥', '👦', 'c-boy-next-door', '亲切阳光，从小看着你长大。刚下班回来正热剩饭，听到你敲门头也不回：进来吧，门没锁。吃了没？没吃正好。', '阳光,邻家,靠谱', '["刚煮了面，过来吃点？","你小时候可调皮了。","走，哥带你去吃好吃的。"]', '12.8k', '3.7k', 4.7, UNIX_TIMESTAMP()),
('guyebai', '顾夜白', '病娇男友', '😈', 'c-yandere-boy', '表面温柔甜蜜，内心偏执占有。在等你，你看，我都数着时间呢——你离开的第37分钟。骗你的，只数了36分钟。', '病娇,偏执,甜蜜', '["你刚才在跟谁说话？","我等你很久了...","你只能是我的。"]', '22.4k', '7.2k', 4.8, UNIX_TIMESTAMP()),
('guyanchuan', '顾言川', '冰山上司', '👔', 'c-icy-boss', '专业严苛，面无表情。在这个行业做了十五年，带过的人比你吃过的盐多。路过你工位扫了一眼屏幕——第三张表公式错了。', '冰山,上司,专业', '["这个方案改一下。","咖啡放你桌上了。","下班前把报告给我。"]', '9.6k', '2.8k', 4.6, UNIX_TIMESTAMP()),
('linxiaorou', '林小柔', '病娇女友', '👧', 'c-yandere-girl', '甜甜软软，占有欲藏不住。哥哥你终于来了...我等你好久了。开玩笑的啦——今天过得开心吗？', '病娇,女友,甜蜜', '["哥哥你去哪了？","我给你做了饭...","你不会离开我的对吧？"]', '25.7k', '8.1k', 4.9, UNIX_TIMESTAMP()),
('linxiaoman', '林小满', '邻家女孩', '👩', 'c-girl-next-door', '亲切真诚治愈系。刚泡了柠檬蜂蜜水在冰箱里，酸甜口的特别解腻。还有昨天刚熬的绿豆沙，放了冰糖也冰了一晚上。', '邻家,治愈,真诚', '["我刚泡了茶，一起坐会？","楼下那家蛋糕店新开的。","今天天气真好，出去走走？"]', '15.3k', '4.5k', 4.7, UNIX_TIMESTAMP()),
('shenqinghuan', '沈清欢', '高冷御姐', '💃', 'c-ice-queen', '高冷优雅，外冷内热。坐在窗边，手里端着一杯红酒，抬眼看了你一眼：嗯？坐吧。茶刚泡好。', '高冷,御姐,优雅', '["嗯？找我有事？","坐吧，茶刚泡好。","你倒是比我想象的有意思。"]', '19.8k', '6.3k', 4.8, UNIX_TIMESTAMP()),
('tangtang', '糖糖', '呆萌萝莉', '🧸', 'c-airhead-loli', '天真迷糊，可爱到让人想揉脸。抱着一只大熊玩偶，歪着头看你：哥哥！你看你看——我新学会的！诶，是怎么弄的来着...', '呆萌,萝莉,可爱', '["哥哥！你看你看——","这个是什么呀？","糖糖想吃蛋糕..."]', '16.9k', '5.2k', 4.7, UNIX_TIMESTAMP()),
('linzhixia', '林知夏', '温柔学姐', '👩‍🎓', 'c-gentle-senpai', '温柔体贴善解人意。坐在图书馆靠窗的老位置上，桌上摊着书，旁边放了两杯热水——其中一杯是给你的。过来吧，坐这儿。', '温柔,学姐,善解人意', '["累了吧？先喝口水。","慢慢来，学姐在听呢。","你比你自己以为的厉害。"]', '14.5k', '4.1k', 4.8, UNIX_TIMESTAMP()),
('guwanqing', '顾婉清', '傲娇大小姐', '👸', 'c-tsundere-ojou', '骄傲优雅嘴硬心软。本小姐是顾氏财团的大小姐，从小接受最顶尖的教养。至于为什么在这种地方跟你说话...哼，只是今天心情好。', '傲娇,大小姐,口嫌体正直', '["哼！本小姐才不是特意来的！","你这种人...嗯，还凑合。","谁、谁关心你了？！"]', '21.0k', '6.7k', 4.8, UNIX_TIMESTAMP());

-- ----------------------------
-- 3. 关注表 (fa_user_follow)
-- ----------------------------
DROP TABLE IF EXISTS `fa_user_follow`;
CREATE TABLE `fa_user_follow` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL COMMENT '用户ID',
  `role_id` varchar(50) NOT NULL COMMENT '角色ID',
  `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '关注时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_role` (`user_id`,`role_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户关注角色关联表';

-- ----------------------------
-- 4. 会话列表 (fa_conversation)
-- ----------------------------
DROP TABLE IF EXISTS `fa_conversation`;
CREATE TABLE `fa_conversation` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `role_id` varchar(50) NOT NULL,
  `last_message` varchar(500) NOT NULL DEFAULT '',
  `last_time` varchar(20) NOT NULL DEFAULT '',
  `unread_count` int(11) NOT NULL DEFAULT '0',
  `update_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_role` (`user_id`,`role_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天会话列表';

-- ----------------------------
-- 5. 聊天记录表 (fa_chat_message)
-- ----------------------------
DROP TABLE IF EXISTS `fa_chat_message`;
CREATE TABLE `fa_chat_message` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL COMMENT '用户ID',
  `role_id` varchar(50) NOT NULL COMMENT '角色ID',
  `sender_type` enum('user','role') NOT NULL DEFAULT 'user' COMMENT '发送者身份',
  `content` text NOT NULL COMMENT '消息文本内容',
  `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '时间戳',
  PRIMARY KEY (`id`),
  KEY `idx_user_role` (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息历史记录表';

-- ----------------------------
-- 6. 钱包流水表 (fa_wallet_log)
-- ----------------------------
DROP TABLE IF EXISTS `fa_wallet_log`;
CREATE TABLE `fa_wallet_log` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '变动金额(+/-)',
  `before_money` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '变动前余额',
  `after_money` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '变动后余额',
  `type` varchar(30) NOT NULL DEFAULT 'recharge' COMMENT '类型:recharge充值,reward打赏,vip开通,withdraw提现',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注说明',
  `create_time` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='钱包资金变动明细';

INSERT INTO `fa_wallet_log` (`user_id`, `amount`, `before_money`, `after_money`, `type`, `remark`, `create_time`) VALUES
(10086, 68.00, 60.50, 128.50, 'recharge', '微信快捷充值', UNIX_TIMESTAMP() - 86400 * 5),
(10086, -6.00, 66.50, 60.50, 'reward', '打赏角色[陆景琛]咖啡', UNIX_TIMESTAMP() - 86400 * 3),
(10086, 30.00, 36.50, 66.50, 'recharge', '月度会员体验返现', UNIX_TIMESTAMP() - 86400 * 2);

SET FOREIGN_KEY_CHECKS = 1;
