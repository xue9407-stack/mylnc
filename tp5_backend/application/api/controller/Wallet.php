<?php
namespace app\api\controller;

use think\Db;

/**
 * 钱包与资产控制器 - PHP 5.6 & MySQL 5.6
 */
class Wallet extends Base
{
    /**
     * 获取钱包资产信息与明细
     */
    public function info()
    {
        $user = Db::name('user')->where('id', $this->userId)->find();
        $money = $user ? $user['money'] : '128.50';
        $score = $user ? $user['score'] : 328;

        $logs = Db::name('wallet_log')
            ->where('user_id', $this->userId)
            ->order('create_time desc')
            ->limit(10)
            ->select();

        return $this->success('获取成功', [
            'balance'       => $money,
            'withdrawable'  => '56.00',
            'score'         => $score,
            'logs'          => $logs
        ]);
    }

    /**
     * 钱包充值
     */
    public function recharge()
    {
        $amount = floatval($this->request->post('amount', 0));
        if ($amount <= 0) {
            return $this->error('充值金额必须大于0');
        }

        $user = Db::name('user')->where('id', $this->userId)->find();
        $before = $user ? floatval($user['money']) : 128.50;
        $after = $before + $amount;

        Db::name('user')->where('id', $this->userId)->update([
            'money'       => $after,
            'update_time' => time()
        ]);

        Db::name('wallet_log')->insert([
            'user_id'      => $this->userId,
            'amount'       => $amount,
            'before_money' => $before,
            'after_money'  => $after,
            'type'         => 'recharge',
            'remark'       => '在线快捷充值',
            'create_time'  => time()
        ]);

        return $this->success('充值成功', [
            'new_balance' => number_format($after, 2, '.', '')
        ]);
    }
}
