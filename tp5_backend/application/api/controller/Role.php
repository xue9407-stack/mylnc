<?php
namespace app\api\controller;

use think\Db;

/**
 * 角色控制器 - PHP 5.6 & MySQL 5.6
 */
class Role extends Base
{
    /**
     * 角色列表 (支持分类筛选与搜索)
     */
    public function index()
    {
        $category = trim($this->request->get('category', '全部'));
        $keyword = trim($this->request->get('keyword', ''));

        $query = Db::name('role')->where('status', 1);

        if ($category !== '全部' && !empty($category)) {
            $query->where('tags|title', 'like', '%' . $category . '%');
        }

        if (!empty($keyword)) {
            $query->where('name|title|tags|desc', 'like', '%' . $keyword . '%');
        }

        $list = $query->order('is_official desc, create_time desc')->select();

        // 格式化 tags 和 topics
        foreach ($list as &$item) {
            $item['tags'] = !empty($item['tags']) ? explode(',', $item['tags']) : [];
            $item['topics'] = !empty($item['topics']) ? json_decode($item['topics'], true) : [];
        }

        return $this->success('获取成功', $list);
    }

    /**
     * 角色详情
     */
    public function detail()
    {
        $id = $this->request->param('id');
        $role = Db::name('role')->where('id', $id)->find();
        if (!$role) {
            return $this->error('角色未找到');
        }

        $role['tags'] = !empty($role['tags']) ? explode(',', $role['tags']) : [];
        $role['topics'] = !empty($role['topics']) ? json_decode($role['topics'], true) : [];

        // 检查当前用户是否已关注
        $isFollowed = Db::name('user_follow')
            ->where('user_id', $this->userId)
            ->where('role_id', $id)
            ->count() > 0;

        $role['is_followed'] = $isFollowed;

        return $this->success('获取成功', $role);
    }

    /**
     * 关注/取消关注角色
     */
    public function toggleFollow()
    {
        $roleId = trim($this->request->post('role_id', ''));
        if (empty($roleId)) {
            return $this->error('role_id 不能为空');
        }

        $exist = Db::name('user_follow')
            ->where('user_id', $this->userId)
            ->where('role_id', $roleId)
            ->find();

        if ($exist) {
            Db::name('user_follow')->where('id', $exist['id'])->delete();
            return $this->success('已取消关注', ['is_followed' => false]);
        } else {
            Db::name('user_follow')->insert([
                'user_id'     => $this->userId,
                'role_id'     => $roleId,
                'create_time' => time()
            ]);
            return $this->success('关注成功', ['is_followed' => true]);
        }
    }

    /**
     * 自定义创建角色 (创作中心)
     */
    public function createRole()
    {
        $name = trim($this->request->post('name', ''));
        $title = trim($this->request->post('title', ''));
        $emoji = trim($this->request->post('emoji', '✨'));
        $desc = trim($this->request->post('desc', ''));
        $tags = trim($this->request->post('tags', ''));
        $topics = $this->request->post('topics/a', []);

        if (empty($name) || empty($title) || empty($desc)) {
            return $this->error('角色名称、头衔与描述不能为空');
        }

        $id = 'custom_' . time() . '_' . rand(100, 999);
        $covers = ['c-domineering', 'c-warm-senpai', 'c-boy-next-door', 'c-ice-queen', 'c-gentle-senpai', 'c-tsundere-ojou'];
        $cover = $covers[array_rand($covers)];

        Db::name('role')->insert([
            'id'          => $id,
            'name'        => $name,
            'title'       => $title,
            'emoji'       => $emoji,
            'cover_class' => $cover,
            'desc'        => $desc,
            'tags'        => is_array($tags) ? implode(',', $tags) : $tags,
            'topics'      => json_encode($topics, JSON_UNESCAPED_UNICODE),
            'users_count' => '1',
            'follows_count' => '0',
            'rating'      => 5.0,
            'is_official' => 0,
            'creator_id'  => $this->userId,
            'status'      => 1,
            'create_time' => time()
        ]);

        return $this->success('角色创建并上架成功！', ['id' => $id]);
    }
}
