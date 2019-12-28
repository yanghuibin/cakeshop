//20190325 强制去掉价格购合买判断
var isForceBuy = true;

cartData = cartData || {};
var cartObj = {};

//费南雪（107418）在购物车仅可和普洱小金砖（107968）合买，不可和其他商品合买
var FNXGoodsIds = [107418], PEGoodsIds = [107968];
$(function () {
    cartObj = new Vue({
        el: '.main_cart',
        data: {
            cartData: {},                                   //购物车大对象

            accessories: accessories || [],                 //配件
            markupList: markupList || [],                 //加价购商品列表
            recommendGoods: recommendGoods || [],           //推荐商品
            birthdayList: cartData.birthDayCardList || [],               //默认生日牌
            isShowBirthdayCard: false,                      //是否显示生日牌
            birthdayWords: '',                              //当前设置生日牌商品的生日牌
            currentItemId: '',                              //当前设置生日牌的商品id
            honeyIds: [],                                   //撒娇订单商品id
            specialDinnerware: globalSpecialDinnerware || {},            //某些商品特殊餐具数量

            honeyFetching: false,                           //正在提交撒娇订单
            normalFetching: false,                          //正在提交正常订单
            fetching: false,                                 //是否正在提交订单

            miniProgramFlag: 0,                              //是否小程序环境 1是-1否

            isShowPromotionList: false,                               //是否显示商促选择框
            currentPromotionItemId: 0,                               //当前正在设置优惠的商品
            promotionDetail: '',                                        //优惠详情

            currentCustomizeNameItemId: false,                           //正在修改名称的商品
            isShowCustomizeName: false,                           //是否显示diy名称弹框
            customizeName: '',                               //diy名称

            weeklyAloneSku: weeklyAloneSku || [],              //仅可单独购买的吐司加价购商品列表
            weeklyGoods: {},                              //吐司加价购商品
            weeklyIndex: 0,                          //周周配当前选择项
            isShowWeeklyDesc: false,                     //是否显示说明
            isShowSingleWeeklyGoods: false                       //是否显示单品吐司
        },
        created: function () {
            var self = this;
            this.setData(cartData);

            //小程序不支持撒娇商品
            utils.checkIsMiniProgram(function () {
                self.honeyIds = [];
                self.miniProgramFlag = 1;
            }, function () {
                self.honeyIds = honeyIds;
                self.miniProgramFlag = -1;
            });

            if (window.weeklyGoods) {
                this.weeklyGoods = weeklyGoods;
            }

            //单品吐司
            this.isShowSingleWeeklyGoods = true;
        },
        methods: {
            //设置购物车信息
            setData: function (res) {
                this.cartData = res;
            },

            //获取指定id的商品
            getItemInfo: function (sku_id) {
                var currentItem,
                    amount = 0,
                    attributes = {},
                    goodsName = '',
                    checked = 1,
                    use_bargain_id = 0;
                this.goodsList.forEach(function (item) {
                    if (item.sku_id === sku_id) {
                        currentItem = item;
                    }
                });
                if (currentItem) {
                    amount = currentItem.amount;
                    attributes = $.extend({}, currentItem.attributes);
                    goodsName = currentItem.goods_name;
                    checked = currentItem.checked;
                    use_bargain_id = currentItem.use_bargain_id;
                }
                return {
                    amount: amount,
                    attributes: attributes,
                    goodsName: goodsName,
                    checked: checked,
                    use_bargain_id: use_bargain_id
                };
            },
            //切换选中商品
            toggleItem: function (sku_id) {
                var itemInfo = this.getItemInfo(sku_id),
                    checked = itemInfo.checked;
                this.createData(sku_id, {checked: checked === 1 ? 0 : 1});
            },
            //切换全部商品
            toggleAll: function () {
                var self = this;
                var checked = self.isCheckAll ? 0 : 1,
                    params = self.goodsList.map(function (item) {
                        return {
                            sku_id: item.sku_id,
                            amount: item.amount,
                            attributes: item.attributes,
                            checked: checked
                        }
                    });
                self.updateCart(params);
            },
            //编辑购物车
            updateCartNum: function (sku_id, flag) {
                var self = this,
                    fn = {};
                sku_id = parseInt(sku_id);
                var itemInfo = this.getItemInfo(sku_id),
                    amount = itemInfo.amount;
                amount += flag;
                if (amount <= 0) {
                    var dialog = $.confirm('确定删除该商品吗？', function () {
                        dialog.hide();
                        self.createData(sku_id, {amount: amount});
                    });
                    return;
                }
                //如果是新添加商品，页面滚动到顶部
                if (!itemInfo.goodsName) {
                    fn.success = function () {
                        $('html, body').animate({scrollTop: 0}, 300);
                    };
                }
                self.createData(sku_id, {amount: amount, checked: itemInfo.checked}, fn);
            },
            //显示生日牌
            showBirthdayCard: function (sku_id, words) {
                this.currentItemId = sku_id;
                this.birthdayWords = words;
                this.isShowBirthdayCard = true;
            },
            //隐藏生日牌
            hideBirthdayCard: function () {
                this.isShowBirthdayCard = false;
            },
            //设置生日牌
            setBirthdayWords: function (words) {
                if (utils.len(words) > 28) {
                    $.toast('生日牌最多14个汉字或28个字母');
                    return;
                }
                var self = this;
                var sku_id = this.currentItemId;
                var itemInfo = this.getItemInfo(sku_id),
                    attributes = itemInfo.attributes || {};
                attributes.goods_birthday = words;
                this.createData(sku_id, {attributes: attributes}, {
                    success: function () {
                        self.hideBirthdayCard();
                    }
                });
            },
            //切分
            cut: function (sku_id, num) {
                var itemInfo = this.getItemInfo(sku_id),
                    attributes = itemInfo.attributes || {};
                attributes.goods_cut = attributes.goods_cut > 0 ? '' : num;
                this.createData(sku_id, {attributes: attributes});
            },
            //选择商品优惠信息
            toggleGoodsPromotion: function (sku_id, use_bargain_id) {
                var self = this;
                this.createData(sku_id, {use_bargain_id: use_bargain_id}, {
                    success: function () {
                        self.hideAniPromotion();
                    }
                });
            },
            //单个商品操作构造数据
            createData: function (sku_id, option, fn) {
                fn = fn || {};
                var self = this;
                var itemInfo = self.getItemInfo(sku_id);
                itemInfo = $.extend(itemInfo, option);
                var params = [{
                    sku_id: sku_id,
                    amount: itemInfo.amount,
                    attributes: itemInfo.attributes,
                    use_bargain_id: itemInfo.use_bargain_id,
                    checked: itemInfo.checked
                }];
                self.updateCart(params, fn);
            },
            //编辑购物车公用方法
            updateCart: function (params, fn) {
                fn = fn || {};
                var self = this;
                loading.show();
                globalCart.update({
                    params: params,
                    success: function (res) {
                        res = res || {};
                        self.setData(res);
                        fn.success && fn.success(res);
                    },
                    fail: function (msg) {
                        $.alert(msg);
                        fn.fail && fn.fail();
                    },
                    always: function () {
                        loading.hide();
                        fn.always && fn.always();
                    }
                }, false);
            },
            //去结算，构造形如[['sku_id' => 102541, 'amount' => 1]]的数组参数
            //前置条件 1，未在请求中 2，判断单独购买商品 3，判断是否全部配件
            submit: function (isHoney) {
                if (this.fetching) {
                    return;
                }
                var self = this,
                    params = [],
                    newParams = [],
                    sku_id = 0,
                    hasAlone = false,
                    aloneGoodsName = '',
                    goodsList = self.goodsList,
                    cakeIds = [],
                    accessoriesIds = [],
                    totalNum = 0,                         //总数量
                    pointsGoodsNum = 0,                 //积分商品
                    FNXGoodsNum = 0,                    //费南雪商品数量
                    PEGoodsNum = 0,                     //普洱小金砖商品数量
                    weeklyAloneSkuNum = 0,              //仅可单独购买的吐司商品数量
                    weeklyAloneSingleSkuNum = 0,              //仅可单独购买的吐司商品数量(单品吐司可与特定商品一块购买)
                    weeklyAlonePackageSkuNum = 0,                 //仅可单独购买的吐司商品数量(套餐)
                    weeklyGoodsNum = 0,                 //吐司加价购商品数量
                    canBuyWithToastGoodsNum = 0,                    //可以和吐司馆商品一同购买的商品数量
                    canBuyWithToastGoods = null,                      //可以和吐司馆商品一同购买的商品
                    overMaxAmountGoods = null,               //数量超过自身最大可购买数量的商品
                    toastPackageIds = [106883, 106880, 106876],                         //仅可单独购买的吐司套餐id
                    selectedUpgradePriceGoodsNum = 0,                                       //已经选中了加价升级的商品数量
                    notSelectedUpgradePriceGoodsNum = 0,                                  //可以参加升磅但未选中升磅的商品数量
                    weeklyGoodsIds = self.weeklyGoodsList.map(function (item) {
                        return parseInt(item.uid);
                    });
                //for test
                if (GlobalConfig.site_env === 'alpha') {
                    toastPackageIds = [103700];
                }
                goodsList.forEach(function (item) {
                    if (item.checked) {
                        sku_id = item.sku_id;

                        //有些促销，比如满减，用户可选但没满足条件时，提交订单要过滤掉，用户结算页能使用的促销是using_bargain_id
                        if (item.cartPromotionList.length) {
                            item.use_bargain_id = item.using_bargain_id > 0 ? item.using_bargain_id : -1;
                        }

                        if (item.need_points > 0) {
                            pointsGoodsNum++;
                        }
                        if (item.goods_type === 1) {
                            cakeIds.push(sku_id);
                        }
                        if (self.aloneIds.indexOf(sku_id) !== -1) {
                            hasAlone = true;
                            aloneGoodsName = self.getItemInfo(sku_id).goodsName;
                        }
                        //配件 goods_type
                        if (item.goods_type === 2 || item.goods_type === 3) {
                            accessoriesIds.push(sku_id);
                        }
                        if ($.inArray(sku_id, self.weeklyAloneSku) !== -1) {
                            weeklyAloneSkuNum += item.amount;
                            if ($.inArray(sku_id, toastPackageIds) === -1) {
                                weeklyAloneSingleSkuNum += item.amount;
                            } else {
                                weeklyAlonePackageSkuNum += item.amount;
                            }
                        }
                        if ($.inArray(sku_id, weeklyGoodsIds) !== -1) {
                            weeklyGoodsNum += item.amount;
                        }
                        if (item.preferentialNum > 0 && item.amount > item.preferentialNum && !overMaxAmountGoods) {
                            overMaxAmountGoods = item;
                        }
                        if ($.inArray(sku_id, milkGoods) !== -1) {
                            canBuyWithToastGoodsNum++;
                            if (!canBuyWithToastGoods) {
                                canBuyWithToastGoods = item;
                            }
                        }

                        if ($.inArray(sku_id, FNXGoodsIds) !== -1) {
                            FNXGoodsNum += item.amount;
                        }

                        if ($.inArray(sku_id, PEGoodsIds) !== -1) {
                            PEGoodsNum += item.amount;
                        }

                        if (item.upgradePriceInfo.id && item.use_bargain_id !== item.upgradePriceInfo.id) {
                            notSelectedUpgradePriceGoodsNum++;
                        }
                        if (item.use_bargain_id && item.use_bargain_id === item.upgradePriceInfo.id) {
                            selectedUpgradePriceGoodsNum++;
                        }

                        totalNum += item.amount;

                        params.push({
                            sku_id: sku_id,
                            amount: item.amount,
                            use_bargain_id: item.use_bargain_id,
                            attributes: item.attributes
                        });
                    }
                });
                if (params.length === 0) {
                    $.toast('请先购买商品');
                    return;
                }
                if (hasAlone && params.length !== 1) {
                    $.alert(aloneGoodsName + ' 只能单独下单购买');
                    return;
                }
                if (accessoriesIds.length === params.length) {
                    $.toast('不可以单独购买配件');
                    return;
                }

                if (overMaxAmountGoods) {
                    $.alert(overMaxAmountGoods.goods_name + '购买数量不能大于' + overMaxAmountGoods.preferentialNum);
                    return;
                }

                if (canBuyWithToastGoodsNum > 0 && canBuyWithToastGoodsNum + weeklyAloneSingleSkuNum !== totalNum) {
                    $.alert(canBuyWithToastGoods.goods_name + '只能和特定吐司商品同时购买');
                    return;
                }

                //检查吐司加价购商品
                //仅可单独下单的吐司
                if (weeklyAloneSkuNum > 0) {
                    if (weeklyAloneSkuNum > 1) {
                        $.alert('吐司商品购买数量不能大于1', {
                            confirmText: '我知道了'
                        });
                        return;
                    }
                    if (weeklyAlonePackageSkuNum > 0 && params.length > 1) {
                        $.alert('吐司商品仅可单独购买且数量不能大于1', {
                            confirmText: '我知道了'
                        });
                        return;
                    }
                    if (weeklyAloneSingleSkuNum > 0 && canBuyWithToastGoodsNum + weeklyAloneSingleSkuNum !== totalNum) {
                        $.alert('吐司商品只能和特定商品同时购买');
                        return;
                    }
                }

                if (!isForceBuy) {
                    //吐司可以单独购买，或者仅和蛋糕一块合买
                    if (cakeIds.length === 0 && weeklyGoodsNum === 1) {
                        $.alert('吐司加价购商品不可单独购买，必须和蛋糕商品一起购买！', {
                            confirmText: '我知道了'
                        });
                        return;
                    }
                    if (weeklyGoodsNum > 1) {
                        $.alert('吐司加价购商品只能选择1种且数量不能大于1', {
                            confirmText: '我知道了'
                        });
                        return;
                    }
                    if (weeklyGoodsNum > 0 && pointsGoodsNum > 0) {
                        $.alert('吐司加价购商品和积分商品不能同时购买', {
                            confirmText: '我知道了'
                        });
                        return;
                    }
                }

                if (FNXGoodsNum > 0 && FNXGoodsNum + PEGoodsNum !== totalNum) {
                    $.alert('金砖形费南雪礼盒仅可和普洱小金砖礼盒同时购买', {
                        confirmText: '我知道了'
                    });
                    return;
                }

                //拆单商品暂不参与升磅活动
                if (weeklyGoodsNum > 0) {
                    if (selectedUpgradePriceGoodsNum) {
                        $.alert('您的订单中已选择加价升级优惠，不能与吐司优惠同享哦');
                        return;
                    }
                } else {
                    if (false && notSelectedUpgradePriceGoodsNum && !selectedUpgradePriceGoodsNum) {
                        $.confirm($('<h2 class="orange">您当前选择的蛋糕单品可享受加价升级服务哦^_^，</h2><h3>请选择是否升级？</h3>'), null, {
                            className: 'square_type',
                            hideHeader: true,
                            showClose: true,
                            confirmText: '是，我要升级',
                            cancelText: '否，直接购买',
                            confirmFn: function () {
                                $.removeDialog();
                                newParams = [];
                                params.forEach(function (item) {
                                    item = $.extend({}, item);
                                    goodsList.forEach(function (goods) {
                                        var upgradePriceInfo = goods.upgradePriceInfo;
                                        if (goods.sku_id === item.sku_id) {
                                            if (upgradePriceInfo.id) {
                                                item.use_bargain_id = upgradePriceInfo.id;
                                            }
                                        }
                                    });
                                    newParams.push(item);
                                });
                                self.doSubmit(newParams, weeklyGoodsNum, weeklyAloneSkuNum, isHoney);
                            },
                            cancelFn: function () {
                                $.removeDialog();
                                self.doSubmit(params, weeklyGoodsNum, weeklyAloneSkuNum, isHoney);
                            },
                            closeFn: function () {
                                $.removeDialog();
                            }
                        });
                        return;
                    }
                }
                self.doSubmit(params, weeklyGoodsNum, weeklyAloneSkuNum, isHoney);
            },
            //跳转结算页
            doSubmit: function (params, weeklyGoodsNum, weeklyAloneSkuNum, isHoney) {
                var self = this,
                    activity = '';
                self.fetching = true;
                if (isHoney) {
                    self.honeyFetching = true;
                    activity = 'honey';
                } else {
                    self.normalFetching = true;
                }
                $.ajax({
                    method: 'post',
                    url: '/h5/cart/to-order',
                    data: {
                        params: params,
                        miniProgramFlag: self.miniProgramFlag
                    }
                }).done(function (res) {
                    if (res.error === 0) {
                        //跳转结算页
                        var page = '';
                        if (weeklyGoodsNum > 0) {
                            page = '/weekly-buy';
                            activity = 'weeklyBuy';
                        }
                        if (weeklyAloneSkuNum > 0) {
                            //仅购买吐司商品
                            page = '/exchange';
                            activity = 'exchange';
                        }
                        window.location = '/h5/order' + page + '?buyId=' + res.data.buyId + '&activity=' + activity;
                    } else {
                        $.alert(res.msg);
                    }
                }).fail(function () {
                    $.alert('提交失败，请重试');
                }).always(function () {
                    self.honeyFetching = false;
                    self.normalFetching = false;
                    self.fetching = false;
                });
            },

            //购买吐司加价购商品
            buyWeeklyGoods: function (uid) {
                var self = this,
                    sku_id = parseInt(uid) || parseInt(self.currentWeeklyGoods.uid),
                    itemInfo = this.getItemInfo(sku_id),
                    amount = itemInfo.amount;
                if (amount > 0) {
                    $.alert('吐司加价购商品只能选择1种且数量不能大于1', {
                        confirmText: '我知道了'
                    });
                    return false;
                }
                amount += 1;
                self.createData(sku_id, {amount: amount, checked: itemInfo.checked}, {
                    success: function () {
                        $.alert('加入购物车成功', {
                            autoClose: true,
                            confirmFn: function () {
                                $.removeDialog();
                                $('html, body').animate({scrollTop: 0}, 300);
                            }
                        });
                    }
                });
            },

            //获取周周配商品
            getWeeklyGoods: function (isSingle) {
                var arr = [];
                this.weeklyGoodsList.forEach(function (item) {
                    if (isSingle) {
                        if (item.childSpecs && item.childSpecs.length < 2) {
                            arr.push(item);
                        }
                    } else {
                        if (item.childSpecs && item.childSpecs.length > 1) {
                            arr.push(item);
                        }
                    }
                });
                return arr;
            },

            //显示促销弹窗
            showAniPromotion: function (sku_id) {
                this.currentPromotionItemId = sku_id;
                this.isShowPromotionList = true;
            },
            //隐藏促销弹窗
            hideAniPromotion: function () {
                this.currentPromotionItemId = '';
                this.isShowPromotionList = false;
                this.promotionDetail = '';
            },

            //显示diy名称弹窗
            showAniCustomizeName: function (sku_id) {
                this.currentCustomizeNameItemId = sku_id;
                var itemInfo = this.getItemInfo(sku_id);
                this.isShowCustomizeName = true;
                this.customizeName = itemInfo.attributes.customize_name || itemInfo.goodsName;
            },
            //隐藏diy名称弹窗
            hideAniCustomizeName: function () {
                this.isShowCustomizeName = false;
            },
            //diy商品名称
            setCustomizeName: function () {
                var self = this,
                    sku_id = self.currentCustomizeNameItemId,
                    itemInfo = self.getItemInfo(sku_id),
                    attributes = itemInfo.attributes,
                    customizeName = self.customizeName;
                if (customizeName.length === 0) {
                    $.toast('自定义商品名称不能为空');
                    return;
                }
                if (utils.len(customizeName) > 28) {
                    $.toast('自定义商品名称最多14个汉字或28个字母');
                    return;
                }
                if (customizeName === itemInfo.goodsName) {
                    this.hideAniCustomizeName();
                    return;
                }
                attributes.customize_name = customizeName;
                this.createData(sku_id, {attributes: attributes}, {
                    success: function () {
                        self.hideAniCustomizeName();
                    }
                });
            }
        },
        computed: {
            //购物车商品列表由仅可单独购买商品列表和可正常购买商品列表组成，其他站点商品及不可购买商品排除
            goodsList: function () {
                var self = this,
                    specialDinnerware = self.specialDinnerware,
                    weeklyAloneSku = self.weeklyAloneSku,
                    weeklyGoodsIds = this.weeklyGoodsList.map(function (item) {
                        return parseInt(item.uid);
                    });
                return this.buyList.map(function (item) {
                    //假如用户已经登录并且没有心享卡权限时，心享价设为0
                    if (customerInfo.privilege && !customerInfo.privilege.has_pass_card) {
                        item.passcard_price = 0;
                    }
                    item.isHoney = $.inArray(item.sku_id, self.honeyIds) !== -1;
                    for (var key in specialDinnerware) {
                        if (specialDinnerware.hasOwnProperty(key)) {
                            if (parseInt(key) === item.sku_id) {
                                item.specialDinnerware = specialDinnerware[key];
                            }
                        }
                    }
                    //吐司加价购数量仅为1
                    item.notAdd = $.inArray(item.sku_id, weeklyGoodsIds) !== -1;
                    //单独购买的吐司数量仅为1
                    if (!item.notAdd) {
                        item.notAdd = $.inArray(item.sku_id, weeklyAloneSku) !== -1;
                    }
                    //加价购商品根据后台配置读取最大数量
                    if (!item.notAdd && item.preferentialNum > 0) {
                        item.notAdd = item.amount >= item.preferentialNum;
                    }

                    //商品优惠信息区分普通优惠和升磅优惠
                    var cartSkuPromotionList = item.promotionList || [],
                        cartPromotionList = [],
                        upgradePriceInfo = {};
                    cartSkuPromotionList.forEach(function (promotionItem) {
                        cartPromotionList.push(promotionItem);
                        if (promotionItem.type === 'UPGRADE_POUNDS') {
                            upgradePriceInfo = promotionItem;
                        }
                    });
                    item.cartPromotionList = cartPromotionList;
                    item.upgradePriceInfo = upgradePriceInfo;

                    item.promotionIsUsed = cartSkuPromotionList.some(function (promotionItem) {
                        return promotionItem.isuse || promotionItem.selected;
                    });

                    return item;
                });
            },
            //是否选中全部
            isCheckAll: function () {
                return this.goodsList.every(function (item) {
                    return item.checked === 1;
                });
            },
            //仅可单独购买商品的id
            aloneIds: function () {
                var newArr = this.goodsList.filter(function (item) {
                    return item.alone;
                });
                return newArr.map(function (item) {
                    return item.sku_id;
                });
            },
            //是否可以提交撒娇订单
            canUseHoney: function () {
                var self = this,
                    flag = false,
                    list = this.goodsList.filter(function (item) {
                        return item.checked;
                    });
                list.forEach(function (item) {
                    if (!(item.goods_type === 1 || item.goods_type === 2 || item.goods_type === 3)) {
                        flag = true;
                    }
                    if (item.goods_type === 1 && $.inArray(item.sku_id, self.honeyIds) === -1) {
                        flag = true;
                    }
                });
                return flag || self.honeyFetching;
            },
            //是否显示撒娇订单按钮
            showHoneyBtn: function () {
                var self = this;
                return this.goodsList.some(function (item) {
                    return $.inArray(item.sku_id, self.honeyIds) !== -1;
                });
            },
            //吐司加价购商品列表
            weeklyGoodsList: function () {
                var weeklyGoods = this.weeklyGoods;
                var arr = [];
                for (var key in weeklyGoods) {
                    if (weeklyGoods.hasOwnProperty(key)) {
                        arr.push(weeklyGoods[key]);
                    }
                }
                return arr;
            },
            //吐司单品
            singleWeeklyGoodsList: function () {
                return this.getWeeklyGoods(true);
            },
            //吐司礼包
            notSingleWeeklyGoodsList: function () {
                return this.getWeeklyGoods();
            },
            //当前吐司加价购商品
            currentWeeklyGoods: function () {
                return this.notSingleWeeklyGoodsList[this.weeklyIndex] || {};
            },

            //根据商品促销分组
            goodsListGroup: function () {
                var self = this,
                    tempGroup = [],
                    newArr = [],
                    isInGroup;
                self.goodsList.forEach(function (goodsItem) {
                    var sku_id = goodsItem.sku_id;
                    isInGroup = false;
                    self.promotionGroupList.forEach(function (promotionItem) {
                        var promotionId = promotionItem.id,
                            skuids = promotionItem.skuids || [];
                        if ($.inArray(sku_id, skuids) !== -1) {
                            isInGroup = true;
                            tempGroup = newArr.filter(function (group) {
                                return group.promotionId === promotionId;
                            });
                            if (tempGroup[0]) {
                                tempGroup[0].list.push(goodsItem);
                            } else {
                                tempGroup = {
                                    promotionId: promotionId,
                                    uuid: utils.uuid(),
                                    type: promotionItem.type,
                                    remark: promotionItem.remark,
                                    amount: promotionItem.amount,
                                    list: [goodsItem]
                                };
                                newArr.push(tempGroup);
                            }
                        }
                    });
                    if (!isInGroup) {
                        newArr.push({promotionId: 0, uuid: utils.uuid(), remark: '', list: [goodsItem]});
                    }
                });
                return newArr;
            },
            //当前选择优惠的商品
            promotionGoods: function () {
                var self = this,
                    goods = this.goodsList.filter(function (item) {
                        return item.sku_id === self.currentPromotionItemId;
                    });
                return goods.length ? goods[0] : {};
            },
            //当前选择商品的优惠列表
            promotionList: function () {
                return this.promotionGoods.promotionList || [];
            },

            //正常商品列表
            buyList: function () {
                return this.cartData.buy_list || [];
            },

            //购物车商品数量
            itemCount: function () {
                return this.cartData.count || 0;
            },

            //总金额
            totalPrice: function () {
                return this.cartData.totalPrice || 0;
            },

            //优惠金额
            discountsPrice: function () {
                return this.cartData.discountsPrice || 0;
            },

            //订单促销
            orderPromotionList: function () {
                return this.cartData.promotionList || [];
            },

            //分组商品促销
            promotionGroupList: function () {
                return this.cartData.promotionGroupList || [];
            },

            //是否显示配件
            isShowAccessories: function () {
                return this.cartData.isShowParts;
            }
        },
        filters: {
            //拼接购物车商品主图
            mainPic: function (img) {
                return GlobalConfig.imageRoot + '/goods/' + img;
            },
            //价格
            salePrice: function (price) {
                price = price > 0 ? price : 0;
                return parseFloat(utils.currency(price));
            },
            //促销标签
            promotionType: function (key) {
                return PROMOTION_TYPE[key] || '促销';
            }
        },
        watch: {}
    });
    //点击购买弹出购买框
    $(document).on('click', '.buy_btn', function () {
        var itemId = $(this).parents('li').attr('data-id');
        cartObj.updateCartNum(itemId, 1);
    });
});

//价格优先级 销售价 > 积分价格 > 心享价 > 加价购 > 市场价 最多两个