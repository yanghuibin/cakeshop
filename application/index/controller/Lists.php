<?php
namespace app\index\controller;
use app\admin\controller\Base;
use think\Db;
class Lists extends Base
{
    public function index()
    {
    	$list_result = Db::name('product')->select();
    	$this->assign('list_result',$list_result);
     	return $this->fetch();
    }
}
