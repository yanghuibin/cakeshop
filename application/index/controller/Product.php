<?php
namespace app\index\controller;
use app\index\controller\Base;
use think\Db;

class Product extends Base{
    public function detail()
    {
        $product_id = input('product_id');
        $product_result = Db::name('product')->where('product_id',$product_id)->find();
        $this->assign('product_result',$product_result);
        $recommend_result = Db::name('product')->limit(6)->select();
        $this->assign('recommend_result',$recommend_result);
        return $this->fetch('detail');
    }
}