<?php
namespace app\api\controller;

use think\Controller;
use think\Response;
use think\Request;

/**
 * ThinkPHP 5 API 基础控制器 (兼容 PHP 5.6)
 */
class Base extends Controller
{
    protected $request;
    protected $userId = 10086; // 默认测试用户ID

    public function _initialize()
    {
        parent::_initialize();
        $this->request = Request::instance();
        
        // 跨域支持 (CORS)
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, token');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        
        if ($this->request->isOptions()) {
            exit();
        }

        // 解析 Token
        $token = $this->request->header('token', $this->request->param('token', ''));
        if (!empty($token)) {
            $parsedId = intval(base64_decode($token));
            if ($parsedId > 0) {
                $this->userId = $parsedId;
            }
        }
    }

    /**
     * TP5 成功标准返回
     */
    protected function success($msg = 'success', $data = null, $code = 1)
    {
        $response = [
            'code' => $code,
            'msg'  => $msg,
            'time' => time(),
            'data' => $data,
        ];
        return Response::create($response, 'json', 200);
    }

    /**
     * TP5 错误标准返回
     */
    protected function error($msg = 'error', $code = 0, $data = null)
    {
        $response = [
            'code' => $code,
            'msg'  => $msg,
            'time' => time(),
            'data' => $data,
        ];
        return Response::create($response, 'json', 200);
    }
}
