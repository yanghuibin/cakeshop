<?php
namespace app\admin\controller;
use app\admin\controller\Base;
use think\Db;
class Category extends Base
{
    public function index()
    {
        $category_result = Db::name('category')->select();
        $this->assign('category_result',$category_result);
        return $this->fetch();
    }

    public function add()
    {
        if (request()->isPost()){
            $data = input('post.');
            $file = request()->file('category_img');
            if($file){
                //将传入的图片移动到框架应用根目录/public/uploads/category 目录下，ROOT_PATH是根目录下，DS是代表斜杠 /
                $path = ROOT_PATH . 'public' . DS . 'static' . DS . 'uploads' . DS . 'category_img' . DS;

                $info = $file->move($path);
                if($info){
                    $data['category_img'] = request()->domain() . '/' . 'static/uploads/category_img/' . $info->getSaveName();
                }else{
                    // 上传失败获取错误信息
                    echo $file->getError();
                    die;
                }
            }
            $category_result= Db::name('category')->insert($data);
            if($category_result){
                return $this->success('分类添加成功','category/index');
            }else{
                return $this->error('分类添加失败');
            }
        }else{
            return $this->fetch();
        }
    }

    public function detail()
    {
        $category_id = input('category_id');
        $category_result = Db::name('category')->where('category_id',$category_id)->find();
        $this->assign('category_result',$category_result);
        return $this->fetch();
    }

    public function edit(){
        if (request()->isPost()){
            $data = input('post.');
            $file = request()->file('category_img');

            if($file){
                //将传入的图片移动到框架应用根目录/public/uploads/category 目录下，ROOT_PATH是根目录下，DS是代表斜杠 /
                $path = ROOT_PATH . 'public' . DS . 'static' . DS . 'uploads' . DS . 'category_img' . DS;
                $info = $file->move($path);
                if($info){
                    $data['category_img'] = request()->domain() . '/' . 'static/uploads/category_img/' . $info->getSaveName();
                }else{
                    // 上传失败获取错误信息
                    echo $file->getError();
                    die;
                }
            }
                if(isset($data['category_is_show'])){
                    $data['category_is_show']=1;
                }else{
                    $data['category_is_show']=0;
                }
            $category_result= Db::name('category')->where('category_id',$data['category_id'])->update($data);
            if($category_result){
                return $this->success('分类更新成功','category/index');
            }else{
                return $this->error('分类更新失败');
            }
        }

    }

    public function del(){
        if(request()->isGet()){
            $category_id = input('category_id');
            if(isset($category_id)){
                return $this->success('删除成功','category/index');
            }else{
                return $this->error('参数错误','category/index');
            }
        }
    }
}
