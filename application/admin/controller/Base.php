<?php
namespace app\admin\controller;
use think\Controller;

class Base extends Controller
{
	//初始化session
	public function _initialize()
    {
        if (!session('username')){
         //   $this->error('请先登录','/admin/login/index');
        }
    }

    public function index()
    {
     	return $this->fetch();
    }
}
