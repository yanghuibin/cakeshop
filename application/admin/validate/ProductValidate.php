<?php

namespace app\admin\validate;
use think\Validate;
class ProductValidate extends Validate
{
    protected $rule = [
        'product_name'  =>  'require|max:60',
        'product_img'   =>  'require',
        'product_description'   =>  'require',
    ];
    protected $message = [
        'product_name.require'  =>  '商品名称未填写',
        'product_name.max'      =>  '商品名称不得超过60字符',
        'product_img'           =>  '商品主图未选择',
    ];
    protected $scene =[
        'add'   =>  ['product_name'=>'require','product_name','product_img','product_description'],
    ];
}