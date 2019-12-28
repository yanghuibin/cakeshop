var carouselSwiper = null,
    specObj = null,
    isDigital = $('#goodsImg').attr('data-digital') == 1;
// happycake  母亲节蛋糕 牛奶周周配diy相关
var groupsArr = [],
    id_step1 = 0,
    id_step2 = 0,
    id_step3 = 0,
    message = '请选择配送周期';  // 牛奶周周配制作提示

//构造添加到购物车的数据
function createCartParams() {
    var params = $.extend(true, [], specObj.addCartParams),
        toastCurrentItem = $.extend({}, specObj.toastCurrentItem);
    if (specObj.isBuyWeeklyToast && toastCurrentItem.postId) {
        params.push({
            sku_id: toastCurrentItem.postId,
            amount: 1,
            checked: 1,
            attributes: {toastCycleList: toastCurrentItem.selectedToastTasteList}
        });
    }
    return params;
}

$(function () {
    //主图
    if ($('#goodsImg img').length > 1) {

        carouselSwiper = new Swiper('#goodsImg', {
            autoplay: 5000,
            loop: !isDigital,
            pagination: '.swiper-pagination',
            observer: true,
            observeParents: true,
            paginationClickable: true,
            autoplayDisableOnInteraction: false
        });
    }
    // 跳转录音说明
    $('#audioTips').click(function () {
        var top = $('#audioDesc').offset().top;
        $('html,body').animate({scrollTop: top});
    });
    //滚动顶部
    BackTop.init();
    // 关闭弹窗
    $('.pop_wrapper_mask').click(function () {
        $('#close').click();
        return false;
    });
    $('#close').click(function () {
        $('.pop_wrapper_inner').removeClass('active');
        setTimeout(function () {
            $('.pop_wrapper_mask').hide();
            $('.global_fix_bottom').show();
            $('#udesk_container').removeClass('active');
        }, 600)
    });

    // 弹窗显示规格选择
    $('#showSpecPop').click(function () {
        $('.global_fix_bottom').hide();
        $('#udesk_container').addClass('active');
        $('.pop_wrapper_inner .content_spec').removeClass('hide').siblings('div').addClass('hide');
        $('.pop_wrapper_mask').show();
        setTimeout(function () {
            $('.pop_wrapper_inner').addClass('active');
            $('.pop_wrapper_inner').removeClass('list');
            $('#scrollWrap').animate({scrollTop: 0});
        }, 200)
    });

    // 弹窗显示是否可录音，是否可使用蛋糕券等
    $('.goods_config').click(function () {
        $('.pop_wrapper_inner .content_message').removeClass('hide').siblings('div').addClass('hide');
        $('.pop_wrapper_mask').show();
        setTimeout(function () {
            $('.pop_wrapper_inner').addClass('active list');
        }, 200)
    });
    // 弹窗显示促销列表
    $('.promotion').click(function () {
        $('.pop_wrapper_inner .content_invoice').removeClass('hide').siblings('div').addClass('hide');
        $('.pop_wrapper_mask').show();
        setTimeout(function () {
            $('.pop_wrapper_inner').addClass('active list');
        }, 200)
    });
    //点击底部加入购物车弹出弹窗
    $('#addCard').click(function () {
        $('#showSpecPop').click();
    });
    // 真正的加入购物车
    $('#add').click(function () {
        var params = createCartParams();
        if ((isHappyCake || isMatherDayCake || isMilkDiy) && params.length < 1) {
            if (isMilkDiy) {
                $.toast(message);
            } else {
                $.toast('请完成所有魔法选择');
            }
            return;
        }
        if (isMilkDiy && specObj.isBuyWeeklyToast && specObj.milkDiySelectedWeeklyCount < specObj.toastWeeklyCount) {
            $.toast('吐司的配送周期不可大于牛奶的配送周期');
            return;
        }

        loading.show();
        globalCart.update({
            params: params,
            success: function () {
                $.toast('加入购物车成功');
                $('#close').click();
            },
            fail: function (msg) {
                $.toast(msg);
            },
            always: function () {
                loading.hide();
            }
        }, true);
    });
    // 立即购买
    $('#bugFlg').click(function () {
        var params = createCartParams();
        if ((isHappyCake || isMatherDayCake || isMilkDiy) && params.length < 1) {
            if (isMilkDiy) {
                $.toast(message);
            } else {
                $.toast('请完成所有魔法选择');
            }
            return;
        }

        if (isMilkDiy && specObj.isBuyWeeklyToast && specObj.milkDiySelectedWeeklyCount < specObj.toastWeeklyCount) {
            $.toast('吐司的配送周期不可大于牛奶的配送周期');
            return;
        }

        app_js.buyItem(params);
    });

    // 重庆卡券兑换立即兑换、预售牛奶立即购买直接进结算页
    $(document).on('click', '.buyFlag_order', function () {
        app_js.buyItem(specObj.addCartParams, null, true);
    });

    //拆单商品立即购买
    $('#groupBuyNow').click(function () {
        var groupBuyUid = $('#groupBuyUid').val();
        var params = [
            {
                sku_id: groupBuyUid,
                amount: 1
            }
        ];
        params.push(specObj.addCartParams[0]);
        app_js.buyItem(params, null, true, {
            success: function (data) {
                window.location = '/h5/order?buyId=' + data.buyId + '&activity=groupBuy';
            }
        });
    });

    //视频
    (function () {
        $('#huayangVideoWrap').insertAfter($('.goods_desc .desc_col img:eq(2)'));
        $('.video_poster').click(function () {
            var me = $(this);
            me.addClass('hide').siblings('video')[0].play();
        });
    })();

/*
    //客服
    (function () {
        utils.checkIsMiniProgram(null, function () {
            $('#serviceBtn').removeClass('hide');
        });
    })();
*/
    // 储值卡、专享兑换券立即购买直接进结算页
    $(document).on('click', '.buyVirtual', function () {
        app_js.buyItem(goods.postId, 1, true);
    });

    /** happycake 制作 **/

    (function () {

        if (!isMilkDiy) {

            function getMyCake(postId, data) {
                loading.show();
                $.ajax({
                    url: '/goods/happy-cake.html',
                    data: {
                        postID: postId,
                        happyKey: data
                    }
                }).done(function (res) {
                    specObj.addCartParams.splice(0, 1);
                    if (res.error === 0) {
                        // specObj.goods = res.data || {};
                        // specObj.specList = res.data.productSpecs || [];
                        // specObj.selectedGoodsId = res.data && res.data.productSpecs && res.data.productSpecs[0].postId;
                        specObj.addCartParams[0] = {
                            sku_id: res.data && res.data.uid,
                            amount: 1,
                            checked: 1
                        };
                        if (res.data.productSpecs) {
                            var currentItemInfo = res.data.productSpecs.filter(function (item) {
                                return item.displaySpec == specObj.currentItem.displaySpec;
                            })[0];
                            var tableware = parseInt(currentItemInfo.specialDinnerware) || parseInt(currentItemInfo.dinnerware),
                                goodsLength = parseInt(currentItemInfo.length),
                                goodsWidth = parseInt(currentItemInfo.width),
                                goodsHeight = parseInt(currentItemInfo.height),
                                goodsWeight = currentItemInfo.weight,
                                str = '';
                            if (goodsLength && goodsWidth && goodsHeight) {
                                str = '约' + goodsLength + 'x' + goodsWidth + 'x' + goodsHeight + 'cm';
                            } else if (goodsLength && goodsWidth) {
                                str = '约' + goodsLength + 'x' + goodsWidth + 'cm';
                            } else if (goodsLength && goodsHeight) {
                                str = '约' + goodsLength + 'x' + goodsHeight + 'cm';
                            }
                            $('.size').html(str);
                            $('.tableware').html('<i></i>含' + tableware + '套餐具');
                            $('.weight').html('<i></i>约' + goodsWeight + 'g');
                            $('.spec.happyCake').removeClass('hide');
                        }
                    } else {
                        $.toast(res.msg);
                    }
                }).always(function () {
                    loading.hide();
                });
            }

            if (isMatherDayCake) {
                groupsArr = [
                    {
                        groupStr: '20005',
                        reviewImgId: '01'
                    },
                    {
                        groupStr: '20010',
                        reviewImgId: '02'
                    },
                    {
                        groupStr: '20005|30005',
                        reviewImgId: '03'
                    },
                    {
                        groupStr: '20010|30005',
                        reviewImgId: '04'
                    },
                    {
                        groupStr: '20005|30010',
                        reviewImgId: '05'
                    },
                    {
                        groupStr: '20010|30010',
                        reviewImgId: '06'
                    }
                ];
            } else if (isHappyCake) {
                groupsArr = [
                    {
                        groupStr: '2005',
                        reviewImgId: '01'
                    },
                    {
                        groupStr: '2010',
                        reviewImgId: '02'
                    },
                    {
                        groupStr: '2015',
                        reviewImgId: '03'
                    },
                    {
                        groupStr: '2005|3005',
                        reviewImgId: '04'
                    },
                    {
                        groupStr: '2010|3005',
                        reviewImgId: '05'
                    },
                    {
                        groupStr: '2015|3005',
                        reviewImgId: '06'
                    },
                    {
                        groupStr: '2005|3010',
                        reviewImgId: '07'
                    },
                    {
                        groupStr: '2010|3010',
                        reviewImgId: '08'
                    },
                    {
                        groupStr: '2015|3010',
                        reviewImgId: '09'
                    }

                ];
            }

            function checkSelect() {
                var cakeParams = {}, spec_motherDay = null;
                if (isMatherDayCake) {
                    spec_motherDay = specObj.currentItem.postId == matherDayCake[0] ? 40005 : 40010;
                }
                if (id_step1 && id_step2 && id_step3) {
                    cakeParams.step = 3;
                    cakeParams.value = id_step1 + '|' + id_step2 + '|' + id_step3 + (spec_motherDay ? '|' + spec_motherDay : '');
                } else {
                    cakeParams.value = id_step2 + (id_step3 ? '|' + id_step3 : '');
                }
                return cakeParams;
            }

            function setReviewImg(str) {
                var currentGroup = groupsArr.filter(function (item) {
                        return item.groupStr == str;
                    })[0], imgDirectory = isMatherDayCake ? 'motherDay' : 'happyCake',
                    imgUrl = staticUrl + 'images/goods/' + imgDirectory + '/group_' + currentGroup.reviewImgId + '.png';
                $('#happycakeReviewImg').attr('src', imgUrl);
            }

            $('.item_step ul > li').click(function () {
                var step = parseInt($(this).parents('.item_step').attr('data-step')),
                    happyParams = '',
                    step1_msg = isMatherDayCake ? '请选择蛋糕坯' : '请选择快乐因子',
                    step2_msg = isMatherDayCake ? '请选择慕斯层' : '请选择开心能量';
                if (step === 1) {
                    $(this).addClass('active').siblings().removeClass('active');
                    id_step2 = parseInt($(this).attr('data-id'));
                } else if (step === 2) {
                    if (id_step2) {
                        id_step3 = parseInt($(this).attr('data-id'));
                        $(this).addClass('active').siblings().removeClass('active');
                    } else {
                        $.toast(step1_msg);
                        return;
                    }
                } else if (step === 3) {
                    if (id_step2 && id_step3) {
                        id_step1 = parseInt($(this).attr('data-id'));
                        $(this).addClass('active').siblings().removeClass('active');
                    } else if (!id_step2) {
                        $.toast(step1_msg);
                        return;
                    } else {
                        $.toast(step2_msg);
                        return;
                    }
                }
                happyParams = checkSelect();
                // 设置选择蛋糕胚和慕斯过程中的预览图
                if (happyParams.step != 3 && happyParams.value) {
                    setReviewImg(happyParams.value);
                }
                // 设置成品预览图及获取成品sku (成品预览图只有三种)
                if (happyParams.step === 3) {
                    var color_id = '',
                        imgDirectory = isMatherDayCake ? 'motherDay' : 'happyCake',
                        imgUrl = '';
                    if (isMatherDayCake) {
                        color_id = happyParams.value.indexOf('30005') > -1 ? 'white' : 'pink';
                    } else {
                        color_id = happyParams.value.indexOf('1005') > -1 ? 'blue' : happyParams.value.indexOf('1010') > -1 ? 'pink' : 'yellow';
                    }
                    imgUrl = staticUrl + 'images/goods/' + imgDirectory + '/' + color_id + '.png'
                    $('#happycakeReviewImg').attr('src', imgUrl);
                    getMyCake(specObj.currentItem.postId, happyParams.value);
                }
            });

        }

    })();


});
// 主图下面的商品基本属性展示（商品名称、价格等）
var detailObj = new Vue({
    el: '#selectSpec',
    data: {
        isDigital: 0,
        goods: {},
        goodsProperty: {},
        showItem: {}
    },
    mounted: function () {
        this.goods = goods;
        // 甜度处理
        if (goods.tags) {
            this.goodsProperty = goods.tags.filter(function (item) {
                return item.groupName === '甜度';
            })[0];
        }
        this.isDigital = isDigital;
    },
    computed: {
        isForceShowMarkup: function () {
            return $.inArray(parseInt(this.showItem.postId), isForceShowMarkupPriceList) !== -1;
        }
    },
    filters: {
        // 处理价格格式
        salePrice: function (price) {
            return parseInt(utils.currency(price));
        }
    }
});
// 促销
var promotionObj = new Vue({
    el: '#promotions',
    data: {
        isGroupBuy: 0,   // 是否是组合购
        showPromotion: []
    },
    created: function () {
        // 是否是组合购
        this.isGroupBuy = isGroupBuy;
    }
});

//喵叽叽商品
var miaoArr = [{
    'goodsId': 110578,
    'special': [{
        'title': '宠溺双拼（原味+咖啡味）',
        'length': 17,
        'width': 5,
        'weight': 280,
        'sweetStr': '1'
    }, {
        'title': '元气双拼（原味+巧克力味）',
        'length': 17,
        'width': 9,
        'weight': 560,
        'sweetStr': '1'
    }]
}, {
    'goodsId': 110576,
    'special': [{
        'title': '傲娇三拼（咖啡味+巧克力味+抹茶味）',
        'length': 17,
        'width': 5,
        'weight': 280,
        'sweetStr': '1'
    }, {
        'title': '原味',
        'length': 17,
        'width': 9,
        'weight': 560,
        'sweetStr': '1'
    }]
}];

//重庆地址
var skuList = [{
    'goodsId': 108471,
    'special': [{
        'title': '金砖形费南雪礼盒（18枚入）',
        'length': 35,
        'width': 20,
        'height': 10,
        'weight': 324,
        'sweetStr': '2'
    }, {
        'title': '千层蝴蝶酥•拾光礼盒（39片装）',
        'length': 22,
        'width': 22,
        'height': 9,
        'weight': 195,
        'sweetStr': '2'
    }, {
        'title': '费南雪金砖形礼盒（8枚入）',
        'length': 23,
        'width': 10,
        'height': 5,
        'weight': 144,
        'sweetStr': '2'
    }, {
        'title': '乐熊熊曲奇礼盒',
        'length': 3,
        'width': 3,
        'height': 0,
        'weight': 190,
        'sweetStr': '2'
    }, {'title': '浪漫巴黎曲奇礼包（混合装）', 'length': 20, 'width': 18, 'height': 0, 'weight': 165, 'sweetStr': '2'}]
},
    {
        'goodsId': 108480,
        'special': [{
            'title': '金砖形费南雪礼盒（18枚入）',
            'length': 35,
            'width': 20,
            'height': 10,
            'weight': 324,
            'sweetStr': '2'
        }, {
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {'title': '蔓越莓曲奇礼盒（樱花粉）', 'length': 11, 'width': 11, 'height': 8, 'weight': 270, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108498,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {
            'title': '费南雪金砖形礼盒（8枚入）',
            'length': 23,
            'width': 10,
            'height': 5,
            'weight': 144,
            'sweetStr': '2'
        }, {'title': '乐熊熊曲奇礼盒', 'length': 3, 'width': 3, 'height': 0, 'weight': 190, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108507,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {
            'title': '费南雪金砖形礼盒（8枚入）',
            'length': 23,
            'width': 10,
            'height': 5,
            'weight': 144,
            'sweetStr': '2'
        }, {'title': '浪漫巴黎曲奇礼包（混合装）', 'length': 20, 'width': 18, 'height': 0, 'weight': 165, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108871,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {'title': '乐熊熊曲奇礼盒', 'length': 3, 'width': 3, 'height': 0, 'weight': 190, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108874,
        'special': [{
            'title': '金砖形费南雪礼盒（18枚入）',
            'length': 35,
            'width': 20,
            'height': 10,
            'weight': 324,
            'sweetStr': '2'
        }, {
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {
            'title': '蔓越莓曲奇礼盒（樱花粉）',
            'length': 11,
            'width': 11,
            'height': 8,
            'weight': 270,
            'sweetStr': '2'
        }, {
            'title': '核桃曲奇礼盒（迷迭紫）',
            'length': 11,
            'width': 11,
            'height': 8,
            'weight': 270,
            'sweetStr': '2'
        }, {'title': '千层蝴蝶酥·For Me（原味）', 'length': 3, 'width': 4, 'height': 2, 'weight': 80, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108877,
        'special': [{
            'title': '金砖形费南雪礼盒（18枚入）',
            'length': 35,
            'width': 20,
            'height': 10,
            'weight': 324,
            'sweetStr': '2'
        }, {'title': '乐熊熊曲奇礼盒', 'length': 3, 'width': 3, 'height': 0, 'weight': 190, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108880,
        'special': [{
            'title': '金砖形费南雪礼盒（18枚入）',
            'length': 35,
            'width': 20,
            'height': 10,
            'weight': 324,
            'sweetStr': '2'
        }, {
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {'title': '浪漫巴黎曲奇礼包（混合装）', 'length': 20, 'width': 18, 'height': 0, 'weight': 165, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108883,
        'special': [{
            'title': '金砖形费南雪礼盒（18枚入）',
            'length': 35,
            'width': 20,
            'height': 10,
            'weight': 324,
            'sweetStr': '2'
        }, {
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {'title': '乐熊熊曲奇礼盒', 'length': 3, 'width': 3, 'height': 0, 'weight': 190, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108886,
        'special': [{
            'title': '金砖形费南雪礼盒（18枚入）',
            'length': 35,
            'width': 20,
            'height': 10,
            'weight': 324,
            'sweetStr': '2'
        }, {'title': '浪漫巴黎曲奇礼包（混合装）', 'length': 20, 'width': 18, 'height': 0, 'weight': 165, 'sweetStr': '2'}]
    },
    {
        'goodsId': 108486,
        'special': [{
            'title': '金砖形费南雪礼盒（18枚入）',
            'length': 35,
            'width': 20,
            'height': 10,
            'weight': 324,
            'sweetStr': '2'
        }, {'title': '蔓越莓曲奇礼盒（樱花粉）', 'length': 11, 'width': 11, 'height': 8, 'weight': 270, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109842,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {'title': '浪漫巴黎曲奇礼包（混合装）', 'length': 20, 'width': 18, 'height': 0, 'weight': 165, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109836,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2',
            'num': 2
        }, {'title': '浪漫巴黎曲奇礼包（混合装）', 'length': 20, 'width': 18, 'height': 0, 'weight': 165, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109833,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2',
            'num': 2
        }, {'title': '乐熊熊曲奇礼盒', 'length': 3, 'width': 3, 'height': 0, 'weight': 190, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109830,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2',
            'num': 2
        }, {'title': '蔓越莓曲奇礼盒（樱花粉）', 'length': 11, 'width': 11, 'height': 8, 'weight': 270, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109827,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2',
            'num': 2
        }, {
            'title': '蔓越莓曲奇礼盒（樱花粉）',
            'length': 11,
            'width': 11,
            'height': 8,
            'weight': 270,
            'sweetStr': '2'
        },
            {
                'title': '核桃曲奇礼盒（迷迭紫）',
                'length': 11,
                'width': 11,
                'height': 8,
                'weight': 270,
                'sweetStr': '2'
            }, {'title': '千层蝴蝶酥·For Me（原味）', 'length': 3, 'width': 4, 'height': 2, 'weight': 80, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109824,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2',
            'num': 2
        }, {
            'title': '费南雪金砖形礼盒（8枚入）',
            'length': 23,
            'width': 10,
            'height': 5,
            'weight': 144,
            'sweetStr': '2'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 3,
            'width': 3,
            'height': 0,
            'weight': 190,
            'sweetStr': '2'
        }, {'title': '浪漫巴黎曲奇礼包（混合装）', 'length': 20, 'width': 18, 'height': 0, 'weight': 165, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109821,
        'special': [{
            'title': '千层蝴蝶酥•拾光礼盒（39片装）',
            'length': 22,
            'width': 22,
            'height': 9,
            'weight': 195,
            'sweetStr': '2'
        }, {'title': '蔓越莓曲奇礼盒（樱花粉）', 'length': 11, 'width': 11, 'height': 8, 'weight': 270, 'sweetStr': '2'}]
    },
    {
        'goodsId': 109761,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（原味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '浪漫巴黎曲奇礼包（混合装）',
            'length': 20,
            'width': 18,
            'height': 0,
            'weight': 165,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109767,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（抹茶味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109764,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（原味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '费南雪金砖形礼盒（8枚入）',
            'length': 23,
            'width': 10,
            'height': 5,
            'weight': 144,
            'sweetStr': '2'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109770,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（抹茶味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '元气双拼（原味+巧克力味）',
            'length': 17,
            'width': 9,
            'height': 0,
            'weight': 560,
            'sweetStr': '1'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109773,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（抹茶味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '元气双拼（原味+巧克力味）',
            'length': 17,
            'width': 9,
            'height': 0,
            'weight': 560,
            'sweetStr': '1'
        }, {
            'title': '费南雪金砖形礼盒（8枚入）',
            'length': 23,
            'width': 10,
            'height': 5,
            'weight': 144,
            'sweetStr': '2'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }, {
            'title': '浪漫巴黎曲奇礼包（混合装）',
            'length': 20,
            'width': 18,
            'height': 0,
            'weight': 165,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109782,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（巧克力味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '浪漫巴黎曲奇礼包（混合装）',
            'length': 20,
            'width': 18,
            'height': 0,
            'weight': 165,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109785,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（咖啡味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109788,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（巧克力味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '费南雪金砖形礼盒（8枚入）',
            'length': 23,
            'width': 10,
            'height': 5,
            'weight': 144,
            'sweetStr': '2'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109791,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（原味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '软萌双拼（咖啡味+抹茶味）',
            'length': 17,
            'width': 9,
            'height': 0,
            'weight': 560,
            'sweetStr': '1'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }]
    },
    {
        'goodsId': 109794,
        'special': [{
            'title': '喵叽叽云顶小花曲奇礼盒（巧克力味）',
            'length': 17,
            'width': 5,
            'height': 0,
            'weight': 280,
            'sweetStr': '1'
        }, {
            'title': '宠溺双拼（原味+咖啡味）',
            'length': 17,
            'width': 9,
            'height': 0,
            'weight': 560,
            'sweetStr': '1'
        }, {
            'title': '费南雪金砖形礼盒（8枚入）',
            'length': 23,
            'width': 10,
            'height': 5,
            'weight': 144,
            'sweetStr': '2'
        }, {
            'title': '乐熊熊曲奇礼盒',
            'length': 16,
            'width': 16,
            'height': 4,
            'weight': 190,
            'sweetStr': '2'
        }, {
            'title': '浪漫巴黎曲奇礼包（混合装）',
            'length': 20,
            'width': 18,
            'height': 0,
            'weight': 165,
            'sweetStr': '2'
        }]
    }

];
// 弹窗选择规格（正常蛋糕、数字蛋糕）
specObj = new Vue({
    el: '#goodsSpec',
    data: {
        isGroupBuy: 0,   // 是否是组合购
        specPrefixText: '', // 头图下面的商品属性展示是否添加'各'
        isDigital: 0,   // 是否是数字蛋糕
        selectedGoodsId: '',    // 默认选择规格
        goods: {},   // 当前商品大对象
        specList: [],  // 规格选择列表
        promotionList: [],   // 促销列表
        groupList: [],  // 选中的组合购商品列表
        addCartParams: [],  // 添加到购物车所需参数列表
        skuList: skuList,   //重庆套餐sku
        miaoArr: miaoArr,     //喵叽叽
        matherDayCake: [],  //母亲节蛋糕

        /********* 牛奶加价购吐司周周配 ********/
        isBuyWeeklyToast: true,
        toastList: [],                                      //吐司列表
        toastWeeklyCount: 0,                               //当前选中的吐司周数
        toastSpec: '',                                      //当前选中的吐司规格
        toastTaste: '',                                     //当前选中的吐司口味
        toastTasteDiyList: [],                              //当前选择的随心配口味
        /********* 牛奶加价购吐司周周配 ********/

        /********* 牛奶diy ********/
        milkDiyGoodsList: [],
        milkDiySelectedGoodsId: goods.postId,
        milkDiySelectedCount: -1,                       //当前选择的瓶数
        milkDiySelectedWeeklyCount: -1                //当前选中的几周商品
        /********* 牛奶diy ********/
    },
    created: function () {
        // 默认选择规格
        this.selectedGoodsId = parseInt(goods.postId);
        // 是否是数字蛋糕
        this.isDigital = isDigital;
        // 头图下面的商品属性展示是否添加'各'
        this.specPrefixText = specPrefixText;
        // 是否是组合购
        this.isGroupBuy = isGroupBuy;
        // 保存加入购物车所需参数
        if (isHappyCake || isMatherDayCake || isMilkDiy) {
            this.addCartParams = [];
        } else {
            this.addCartParams[0] = {
                sku_id: this.selectedGoodsId,
                amount: 1,
                checked: 1
            };
        }


        /********* 牛奶diy ********/
        if (isMilkDiy) {
            this.createMilkDiyList();
        }
        /********* 牛奶diy ********/

        /********* 牛奶加价购吐司周周配 ********/

        if (goods.toastDetail) {
            this.createToastList();
        }

        /********* 牛奶加价购吐司周周配 ********/
    },
    mounted: function () {
        this.goods = goods;
        this.specList = this.createList(goods.productSpecs);
        if (this.goods.isConstellation && this.specList) {
            this.specList.forEach(function (item) {
                if (item.title) {
                    item.title = item.title.split('-')[1];
                }
            });
        }
        // 是否可购买
        $('#addCard').prop('disabled', parseInt(this.currentItem.buyFlg) !== 1);
        // 头图下面的商品属性展示
        detailObj.showItem = this.currentItem;
        // 促销展示
        promotionObj.showPromotion = this.getPromotions(this.currentItem);
        this.promotionList = this.getPromotions(this.currentItem);
        // 母亲节蛋糕
        this.matherDayCake = matherDayCake;
    },
    methods: {
        getPromotions: function (currentItem) {
            var list = [],
                promotions = goods.promotions;
            for (var i in promotions) {
                if (promotions.hasOwnProperty(i) && parseInt(i) === currentItem.postId) {
                    list = promotions[i];
                }
            }
            return list;
        },
        //处理对象为数组
        createList: function (obj) {
            var list = [],
                sizeArray = obj;
            for (var i in sizeArray) {
                if (sizeArray.hasOwnProperty(i)) {
                    list.push(sizeArray[i]);
                }
            }
            return list;
        },
        //选择商品规格
        selectItem: function (id, num, isConstellation, goodsName) {
            this.selectedGoodsId = parseInt(id);
            detailObj.showItem = this.currentItem;
            // 促销展示
            promotionObj.showPromotion = this.getPromotions(this.currentItem);
            this.promotionList = this.getPromotions(this.currentItem);

            // 保存加入购物车所需参数
            if (!isDigital) {
                this.addCartParams[0] = {
                    sku_id: this.currentItem.postId,
                    amount: 1,
                    checked: 1
                };
            }

            // 数字蛋糕加入购物车参数
            if (num || num === 0) {
                var arr = [], params = [];
                if (num > 9 && !isConstellation) {
                    if (goodsName.indexOf('怦然心动') != -1) {
                        arr.push({
                            sku_id: id,
                            amount: 1,
                            checked: 1
                        });
                    } else {
                        var numCake = num.split('');
                        for (var i in numCake) {
                            this.specList.forEach(function (item, v) {
                                if (item.num == numCake[i]) {
                                    arr.push({
                                        sku_id: item.postId,
                                        amount: 1,
                                        checked: 1
                                    });
                                }
                            })
                        }
                    }
                } else {
                    arr.push({
                        sku_id: id,
                        amount: 1,
                        checked: 1
                    });
                }
                this.addCartParams.splice(0, 1);
                this.addCartParams = arr.concat(this.addCartParams);
            }
            // 是否可购买
            $('#addCard').prop('disabled', parseInt(this.currentItem.buyFlg) !== 1);

            // 切换母亲节蛋糕5-8人食 清除2-4人中选择的所有状态
            if (isHappyCake || isMatherDayCake) {
                $('.item_step ul > li').removeClass('active');
                id_step1 = 0, id_step2 = 0, id_step3 = 0;
                this.addCartParams.splice(0, 1);
                $('.spec.happyCake').addClass('hide');
            }
        },
        // 组合购多选
        selectGroupItem: function (index, id, isMilk, sellOut) {
            var self = this;

            // 库存牛奶售罄
            if (isMilk && sellOut) {
                return;
            }

            if (this.groupList.indexOf(id) > -1) {
                var i = this.groupList.indexOf(id);
                this.groupList.splice(i, 1);
            } else {
                this.groupList.push(id);
            }
            // 保存加入购物车所需参数
            var params_group = this.addCartParams;
            params_group.splice(1, params_group.length - 1);
            this.groupList.forEach(function (item, v) {
                var o = {
                    sku_id: item,
                    amount: 1,
                    checked: 1
                };
                params_group.push(o);
            });
        },

        /********* 牛奶加价购吐司周周配 ********/
        //生产吐司周周配列表
        createToastList: function () {
            var self = this,
                productSpecs = goods.toastDetail && goods.toastDetail.productSpecs || [];
            productSpecs.forEach(function (item) {
                item.toastSpec = item.toastspec;
                item.toastTaste = item.toasttaste;
                item.toastSpec = item.toastspec;
            });
            this.toastList = productSpecs;
            var toastTaste = self.toastSelectedTasteList[0], toastTasteDiyList = [];
            this.$nextTick(function () {
                self.toastWeeklyCount = self.toastWeeklyList[0];
                self.toastSpec = self.toastSpecList[0];
                self.toastTaste = '随心配';
                for (var i = 0; i < self.toastWeeklyList[self.toastWeeklyList.length - 1]; i++) {
                    toastTasteDiyList.push(toastTaste);
                }
                self.toastTasteDiyList = toastTasteDiyList;
            });
        },
        //选择口味
        checkToastTaste: function (index, taste) {
            this.toastTasteDiyList.splice(index, 1, taste);
        },
        /********* 牛奶加价购吐司周周配 ********/

        /********* 牛奶diy ********/
        //构造要用的列表数据
        createMilkDiyList: function () {
            var self = this,
                specList = goods.productSpecs || [],
                milkDiyGoodsList = [],
                weeklyList = [],
                milkDiySelectedGoodsId = self.milkDiySelectedGoodsId;
            specList.forEach(function (item) {
                var weeklyCount = item.weeklySkuCount,
                    goods = {
                        sku_id: item.postId,
                        count: item.weeklySkuAmount,
                        weeklyCount: weeklyCount,         //周数
                        salePrice: item.salePrice,
                        marketPrice: item.marketPrice
                    };
                if ($.inArray(weeklyCount, weeklyList) === -1) {
                    weeklyList.push(weeklyCount);
                    milkDiyGoodsList.push({
                        weeklyCount: weeklyCount,
                        list: [goods]
                    });
                } else {
                    milkDiyGoodsList.forEach(function (list) {
                        if (list.weeklyCount === weeklyCount) {
                            list.list.push(goods);
                        }
                    });
                }
            });
            milkDiyGoodsList.sort(function (a, b) {
                return a.weeklyCount - b.weeklyCount;
            });
            milkDiyGoodsList.forEach(function (item) {
                item.list.sort(function (a, b) {
                    return a.count - b.count;
                });
            });
            this.milkDiyGoodsList = milkDiyGoodsList;
            var weeklyCount = milkDiyGoodsList[0].weeklyCount,
                count = milkDiyGoodsList[0].count;
            if (milkDiySelectedGoodsId) {
                milkDiyGoodsList.forEach(function (item) {
                    item.list.forEach(function (goodsItem) {
                        if (goodsItem.sku_id === milkDiySelectedGoodsId) {
                            weeklyCount = item.weeklyCount;
                            count = goodsItem.count;
                        }
                    });
                });
            }
            self.milkDiySelectedWeeklyCount = weeklyCount;
            self.milkDiySelectedCount = count;
        }
        /********* 牛奶diy ********/
    },
    watch: {
        /********* 牛奶diy ********/
        //切换周数更新商品id
        //切换周数更新商品
        milkDiySelectedList: function (list) {
            var self = this,
                isExists = list.some(function (item) {
                    return item.count === self.milkDiySelectedCount;
                });
            if (!isExists) {
                this.milkDiySelectedCount = list[0].count;
            }
        },

        //切换商品时更换当前商品详情
        milkDiySelectedGoods: function (val) {
            specObj.selectedGoodsId = val.sku_id;
            specObj.addCartParams[0] = {
                sku_id: val.sku_id,
                amount: 1,
                checked: 1
            };
            detailObj.showItem = this.currentItem;
        }
        /********* 牛奶diy ********/
    },
    computed: {
        //当前选中规格
        currentItem: function () {
            var id = this.selectedGoodsId;
            return this.specList.filter(function (item) {
                return parseInt(item.postId) === id;
            })[0] || {};
        },
        //是否显示数字蛋糕
        isShowNumberCakeList: function () {
            var siteId = cookie.get('CITY_ID') || '';
            siteId = parseInt(siteId.split('_')[1]);
            return this.isDigital && $.inArray(siteId, [287, 334, 420, 386]) !== -1;
        },
        // 组合购列表
        groupBuyList: function () {
            return goods.correlation || [];
        },

        /********* 牛奶加价购吐司周周配 ********/
        //吐司可选周期数
        toastWeeklyList: function () {
            var list = utils.uniqueArray(this.toastList.map(function (item) {
                return item.weeklySkuCount;
            }));
            list.sort(function (a, b) {
                return a - b;
            });
            return list;
        },
        //吐司可选规格
        toastSpecList: function () {
            return ['半条', '整条'];
        },
        //吐司可选口味
        toastTasteList: function () {
            return utils.uniqueArray(this.toastList.map(function (item) {
                return item.toastTaste;
            }));
        },
        //随心配口味列表
        toastSelectedTasteList: function () {
            var arr = [];
            this.toastList.forEach(function (item) {
                if (item.weeklyType === 2 && item.toastCycleList && item.toastCycleList.length) {
                    arr = item.toastCycleList.map(function (taste) {
                        return taste.name;
                    });
                }
            });
            return arr;
        },
        //当前选中的吐司商品
        toastCurrentItem: function () {
            var self = this, data = {};
            this.toastList.forEach(function (item) {
                if (item.weeklySkuCount === self.toastWeeklyCount && item.toastSpec === self.toastSpec && item.toastTaste === self.toastTaste) {
                    data = item;
                }
            });
            if (data) {
                if (data.weeklyType === 2) {
                    var tempCycleList = data.toastCycleList,
                        taste,
                        o = {},
                        arr = [];
                    for (var i = 0; i < self.toastWeeklyCount; i++) {
                        taste = self.toastTasteDiyList[i];
                        tempCycleList.forEach(function (cycle) {
                            if (cycle.name === taste) {
                                o = cycle;
                            }
                        });
                        arr.push($.extend(true, {}, o));
                    }
                }
                data.selectedToastTasteList = arr;
            }
            return data;
        },
        //吐司规格文案
        toastSpecDesc: function () {
            var self = this,
                toastCurrentItem = this.toastCurrentItem,
                str = this.toastTaste + this.toastSpec;
            if (toastCurrentItem.weeklyType === 2) {
                var arr = [];
                toastCurrentItem.selectedToastTasteList.forEach(function (item) {
                    arr.push(item.name + self.toastSpec);
                });
                str = arr.join('、');
            }
            return str;
        },
        /********* 牛奶加价购吐司周周配 ********/

        /********* 牛奶diy ********/
        //当前选择的商品
        milkDiySelectedGoods: function () {
            var self = this,
                goods = {};
            this.milkDiyGoodsList.forEach(function (item) {
                if (item.weeklyCount === self.milkDiySelectedWeeklyCount) {
                    item.list.forEach(function (goodsItem) {
                        if (goodsItem.count === self.milkDiySelectedCount) {
                            goods = goodsItem;
                        }
                    });
                }
            });
            return goods;
        },
        //当前选中周可选瓶数
        milkDiySelectedList: function () {
            var list = [],
                weeklyCount = this.milkDiySelectedWeeklyCount;
            this.milkDiyGoodsList.forEach(function (item) {
                if (weeklyCount === item.weeklyCount) {
                    list = item.list;
                }
            });
            return list;
        }
        /********* 牛奶diy ********/
    },
    filters: {
        //处理长度单位
        len: function (val) {
            return parseInt(val);
        },
        //拼接购物车商品主图
        mainPic: function (img) {
            return GlobalConfig.imageRoot + '/goods/' + img;
        },
        //价格
        salePrice: function (price) {
            return parseInt(utils.currency(price));
        }
    }
});

$(function () {
    //富文本编辑器点击加入购物车
    $(document).on('click', '.addCartBtnInDetail', function () {
        var me = $(this),
            uid = me.attr('data-uid');
        app_js.buyItem(uid, 1, false, {
            success: function () {
                $.toast('加入购物车成功');
            }
        });
    });
});