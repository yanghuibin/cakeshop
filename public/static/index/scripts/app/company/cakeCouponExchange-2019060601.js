var snowUpgradeApp;

$(function () {
    $(document).on('click', '.buy_btn_click1', function () {
        var me = $(this);
        $.ajax({
            method: 'get',
            url: '/h5/cart/to-order',
            data: {
                params: [{
                    sku_id: me.attr('data-id'),
                    amount: 1,
                    checked: 1,
                    use_bargain_id: -1
                }],
                extend_flag: 0x1000 | 0x4000 | 0x8000
            }
        }).done(function (res) {
            if (res.error === 0) {
                window.location = '/h5/order?buyId=' + res.data.buyId;
            } else {
                $.alert(res.msg);
            }
        }).fail(function () {
            $.alert('提交失败，请重试');
        }).always(function () {
            loading.hide();
        });
    });

    $(document).on('click', '.buy_btn_click2', function () {
        var me = $(this),
            uid = me.attr('data-uid'),
            goodsName = me.attr('data-goodsName'),
            couponValue = me.attr('data-couponValue'),
            displaySpec = me.attr('data-displaySpec');
        snowUpgradeApp.setGoodsInfo(uid, goodsName, displaySpec, couponValue);
    });

    var nav = $('#exchangeNav'),
        top = nav.offset().top;
    $(window).scroll(function () {
        if ($(window).scrollTop() > top) {
            nav.addClass('fixed');
        } else {
            nav.removeClass('fixed');
        }
    });
    nav.find('a').click(function () {
        var me = $(this);
        me.addClass('active').siblings().removeClass('active');
        $('.p_list_' + me.index()).removeClass('hide').siblings('.p_list').addClass('hide');
    });

    snowUpgradeApp = new Vue({
        el: '#snowUpgrade',
        data: {
            couponValue: 0,                                         //当前商品对象的蛋糕券金额
            currentDesc: '2-4人食',
            beforeGoods: {},                                     //待升级商品信息
            isShowSnowUpgrade: false,                           //是否显示新雪域升级弹框
            snowCakeList: [],                                    //所有新雪域商品列表
            selectedGoodsId: 0                                      //当前选中的新雪域商品id
        },
        created: function () {
            var list = snowCakeList || [];
            this.snowCakeList = list.map(function (item) {
                if (!item.goodsName && !item.uid) {
                    item = $.extend({}, item, {
                        uid: item.postId,
                        goodsMainPic: item.pic,
                        goodsName: item.title
                    });
                }
                return item;
            });
        },
        methods: {
            //设置待升级商品信息
            setGoodsInfo: function (uid, goodsName, displaySpec, couponValue) {
                this.beforeGoods = {uid: uid, goodsName: goodsName, displaySpec: displaySpec};
                this.currentDesc = displaySpec;
                this.isShowSnowUpgrade = true;
                this.couponValue = couponValue;
            },
            //立即升级
            buyNewSnow: function () {
                if (!this.selectedGoodsId) {
                    $.toast('请先选择升级的商品');
                    return;
                }
                app_js.buyItem(this.selectedGoodsId, 1, true);
                this.isShowSnowUpgrade = false;
            }
        },
        computed: {
            //当前商品可升级的新雪域列表
            snowUpgradeList: function () {
                var currentDesc = this.currentDesc;
                return this.snowCakeList.filter(function (item) {
                    return item.displaySpec === currentDesc;
                });
            },
            //升级后的商品
            upgradedGoods: function () {
                var self = this;
                return this.snowUpgradeList.filter(function (item) {
                    return item.uid === self.selectedGoodsId;
                })[0];
            },
            //升级费用
            upgradeFee: function () {
                var fee = 0,
                    currentDesc = this.currentDesc;
                if (currentDesc === '2-4人食') {
                    fee = 40;
                }
                if (currentDesc === '5-8人食') {
                    fee = 122;
                }
                return fee;
            }
        },
        watch: {
            //关闭升级弹窗时清空已选择的蛋糕卡
            isShowSnowUpgrade: function (val) {
                if (!val) {
                    this.selectedGoodsId = 0;
                    this.beforeGoods = {};
                }
            }
        },
        filters: {
            //拼接商品主图
            mainPic: function (img) {
                return GlobalConfig.imageRoot + '/goods/' + img;
            },
            //价格
            salePrice: function (price) {
                price = price > 0 ? price : 0;
                return parseFloat(utils.currency(price));
            }
        }
    });

});