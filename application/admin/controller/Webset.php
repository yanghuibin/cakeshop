<?php
namespace app\admin\controller;
use app\admin\controller\Base;
use think\Db;

class Webset extends Base
{
	//查询获取当前站点的信息
    public function index()
    {
        $data = input('get.');
    	$web_result = Db::name('webset')->where('site_id',$data['site_id'])->find();
    	$this->assign('web_result',$web_result);
     	return $this->fetch();
    }

    //编辑站点信息
    public function edit()
    {
    	$data = input('post.');
    	dump($data);
    	$web_insert_result = Db::name('webset')->where('site_id',$data['site_id'])->update($data);
    	if(!$web_insert_result){
    		$this->error('更新失败');
    	}else{
    		$this->success('更新  成功');
    	}
    	return;
    }
}