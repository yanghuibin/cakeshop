<?php
namespace app\index\controller;
use app\index\controller\Base;
use think\Db;
class Waitting extends Base{
    public function index(){
        return $this->fetch();
    }
}
