<?php
namespace app\api\controller;

use think\Db;

/**
 * 聊天与会话控制器 - PHP 5.6 & MySQL 5.6
 */
class Chat extends Base
{
    /**
     * 发送聊天消息并获取角色回复
     */
    public function send()
    {
        $roleId = trim($this->request->post('role_id', ''));
        $content = trim($this->request->post('content', ''));

        if (empty($roleId) || empty($content)) {
            return $this->error('role_id 和 content 不能为空');
        }

        $role = Db::name('role')->where('id', $roleId)->find();
        if (!$role) {
            return $this->error('角色不存在');
        }

        $now = time();

        // 1. 记录用户消息
        Db::name('chat_message')->insert([
            'user_id'     => $this->userId,
            'role_id'     => $roleId,
            'sender_type' => 'user',
            'content'     => $content,
            'create_time' => $now
        ]);

        // 2. 生成角色回复 (TP5支持调用本地规则或Gemini/大模型API)
        $reply = $this->generateRoleReply($roleId, $content);

        // 3. 记录角色回复消息
        Db::name('chat_message')->insert([
            'user_id'     => $this->userId,
            'role_id'     => $roleId,
            'sender_type' => 'role',
            'content'     => $reply,
            'create_time' => $now + 1
        ]);

        // 4. 更新/插入会话表
        $existConv = Db::name('conversation')
            ->where('user_id', $this->userId)
            ->where('role_id', $roleId)
            ->find();

        $timeStr = date('H:i', $now);
        if ($existConv) {
            Db::name('conversation')->where('id', $existConv['id'])->update([
                'last_message' => $reply,
                'last_time'    => $timeStr,
                'update_time'  => $now
            ]);
        } else {
            Db::name('conversation')->insert([
                'user_id'      => $this->userId,
                'role_id'      => $roleId,
                'last_message' => $reply,
                'last_time'    => $timeStr,
                'unread_count' => 0,
                'update_time'  => $now
            ]);
        }

        return $this->success('发送成功', [
            'role_id'   => $roleId,
            'role_name' => $role['name'],
            'reply'     => $reply,
            'time'      => $timeStr
        ]);
    }

    /**
     * 获取指定角色的聊天历史记录
     */
    public function history()
    {
        $roleId = $this->request->param('role_id');
        if (empty($roleId)) {
            return $this->error('role_id 不能为空');
        }

        $list = Db::name('chat_message')
            ->where('user_id', $this->userId)
            ->where('role_id', $roleId)
            ->order('create_time asc')
            ->limit(50)
            ->select();

        return $this->success('获取成功', $list);
    }

    /**
     * 获取用户所有活跃会话
     */
    public function conversations()
    {
        $list = Db::name('conversation')
            ->alias('c')
            ->join('fa_role r', 'c.role_id = r.id', 'LEFT')
            ->where('c.user_id', $this->userId)
            ->field('c.*, r.name, r.emoji, r.cover_class')
            ->order('c.update_time desc')
            ->select();

        return $this->success('获取成功', $list);
    }

    /**
     * 根据角色个性矩阵生成拟真回复
     */
    private function generateRoleReply($roleId, $text)
    {
        $repliesMap = [
            'lujingchen' => ['女人，你成功引起了我的注意。', '我说了算。这事就这么定了。', '哼，这点小事也来烦我？...说吧，怎么了。', '我的人，轮得到别人说三道四？', '不许熬夜。这是命令。'],
            'linmubai'   => ['没事，有我在。慢慢说。', '行，我知道了。方案有两个，你说哪个，我陪你弄。', '别慌，天塌下来有我顶着。', '嗯，你说得对。那就这么办。'],
            'gubeichen'  => ['多大点事。说，哥给你搞定。', '真拿你没办法。等着，马上到。', '我就知道是你干的。...行了，哥帮你兜着。', '又熬夜？行啊你。'],
            'guyebai'    => ['宝贝...你刚才在跟谁说话？', '我等你很久了呢...你去哪了？', '你是我的，对吧？...当然了。', '别离开我。你走了我怎么办？'],
            'guyanchuan' => ['说重点。', '嗯。这版能看。', '重做。下班前给我。', '因为你有潜力。没潜力的人，我连重做的机会都不会给。'],
            'linxiaorou' => ['哥哥...你刚才为什么不理我？', '我知道错了嘛...你别生我的气好不好？', '你只能是我的...对吧？', '嘿嘿，哥哥最好了。'],
            'linxiaoman' => ['嗯？怎么了？跟我说说呗。', '我刚煮了糖水，你要不要喝一碗？', '你今天好像有点不开心？...不想说就不说，我陪你。', '楼下那家蛋糕店新开的，我们去试试？'],
            'shenqinghuan'=> ['嗯。然后呢？', '说完了？...还行吧。', '我不需要别人觉得我怎么样。', '坐吧。茶在那。'],
            'tangtang'   => ['诶？是这样吗！', '哥哥！你看你看——', '我、我刚才忘了要说什么来着...', '嘿嘿，好吃！'],
            'linzhixia'  => ['辛苦了。先喝口水，慢慢说。', '你觉得呢？...嗯，我补充一个思路。', '没事的，这种事我也干过。', '别急，慢慢来，学姐在听呢。'],
            'guwanqing'  => ['哼！本小姐才不是特意来的！', '你这种人...嗯，还凑合吧。别得意。', '谁、谁关心你了？！', '本小姐说的还能有错？']
        ];

        if (isset($repliesMap[$roleId])) {
            $pool = $repliesMap[$roleId];
            return $pool[array_rand($pool)];
        }

        return '嗯，我收到你的消息了，正在认真倾听你的想法。';
    }
}
