<?php
// +----------------------------------------------------------------------
// | ThinkPHP 5.0 路由定义文件 (RESTful API 规范)
// +----------------------------------------------------------------------
use think\Route;

// 允许跨域预检
Route::options('api/:version/:controller/:action', function() {
    return json(['code' => 1, 'msg' => 'cors preflight ok'])->header([
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Headers' => 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS'
    ]);
});

// v1 版本 API 路由组
Route::group('api/v1', function () {
    // 用户模块
    Route::post('user/login', 'api/User/login');
    Route::post('user/register', 'api/User/register');
    Route::get('user/profile', 'api/User/profile');
    Route::post('user/update', 'api/User/update');

    // 角色模块
    Route::get('role/list', 'api/Role/index');
    Route::get('role/detail/:id', 'api/Role/detail');
    Route::post('role/follow', 'api/Role/toggleFollow');
    Route::post('role/create', 'api/Role/createRole');

    // 聊天模块
    Route::post('chat/send', 'api/Chat/send');
    Route::get('chat/history/:role_id', 'api/Chat/history');
    Route::get('conversation/list', 'api/Chat/conversations');

    // 钱包与会员模块
    Route::get('wallet/info', 'api/Wallet/info');
    Route::post('wallet/recharge', 'api/Wallet/recharge');
    Route::post('wallet/reward', 'api/Wallet/reward');
});
