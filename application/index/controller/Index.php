<?php
namespace app\index\controller;
use app\admin\controller\Base;
use think\Db;
class Index extends Base
{
    public function index()
    {
    	$result = Db::name('product')->where('is_sale',1)->select();
    	$this->assign('result',$result);
     	return $this->fetch();
    }
}
