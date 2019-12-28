<?php

namespace app\admin\controller;
use app\admin\controller\Base;
use think\Db;

class Product extends Base
{
	
	public function index(){
	/**
	* 方法名index
	* 获取product表中所有的记录
	@var recordSet $product_result  查询product记录集
	@return array 
	*/
		$product_result = Db::name('product')->select();
		$this->assign('product_result',$product_result);
		return $this->fetch();
	}

	public function add(){
	/**
	* 添加商品
	*/
		if (request()->isPost()){
            $data = input('post.');

		    //上传图片
            //获取表单上传文件
            $file = request()->file('product_img');
            if($file){
                //将传入的图片移动到框架应用根目录/public/uploads/ 目录下，ROOT_PATH是根目录下，DS是代表斜杠 /
                $path = ROOT_PATH . 'public' . DS . 'static'. DS .'uploads' . DS;
                $info = $file->move($path);
                if($info){
                    $data['product_img'] = request()->domain().'/'. 'static/uploads/' . $info->getSaveName();

                }else{
                    // 上传失败获取错误信息
                    echo $file->getError();die;
                }
            }


            //验证数据表单
            $validate = \think\Loader::validate('ProductValidate');
            if (!$validate->scene('add')->check($data)){
                $this->error($validate->getError());
                die;
            }


            //判断是否上架
            if (isset($data['is_sale']) && $data['is_sale'] =='on'){
                $data['is_sale'] = 1;
            }else{
                $data['is_sale'] = 0;
            }

            //判断是否新品
            if (isset($data['is_new']) && $data['is_new']=='on'){
                $data['is_new'] = 1;
            }else{
                $data['is_new']=0;
            }
            //判断是否热销
            if (isset($data['is_hot']) && $data['is_hot']=='on'){
                $data['is_hot'] = 1;
            }else{
                $data['is_hot']=0;
            }

			$result = Db::name('product')->insert($data);
			if($result){
				return $this->success('添加成功','product/index');
			}else{
				return $this->error('添加失败');
			}
			return;
		}elseif (request()->isGet()){
            $category_result = Db::name('category')->select();
            $this->assign('category_result',$category_result);
            return  $this->fetch();

        }
	}
	
	public function detail(){
	/**
	* 商品详情
	*/

        //$data=input('get.');
        $product_id = input('product_id');
        $product_result = Db::name('product')->where('product_id',$product_id)->find();
        $this->assign('product_result',$product_result);
        return $this->fetch('detail');
	}

	public function edit(){
	/**
	* 编辑商品
	*/
        $data=input('post.');
        $product_result = Db::name('product')->where('product_id',$data['product_id'])->update($data);
        if(isset($product_result)){
            return $this->success('更新成功','admin/product/index');
        }else{
            return  $this->error('更新失败');
        }
	}

	public function del(){
	/**
	* 删除商品
	*/
	
        $product_id = input('product_id');

        if(isset($product_id)){
            $del_result = Db::name('product')->where('product_id',$product_id)->delete();
            if ($del_result){

                return $this->success('删除成功','admin/product/index');
            }else{
                return $return->error('添加失败');
            }
        }else{
            return $this->error('参数异常');
        }
	}
}