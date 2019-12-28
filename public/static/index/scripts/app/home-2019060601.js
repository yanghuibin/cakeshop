var homeVue = null;
$(function () {

    new Swiper('#slider', {
        autoplay: 5000,
        loop: true,
        pagination: '.swiper-pagination',
        lazyLoading: true,
        autoplayDisableOnInteraction: false
    });

    //站点选择器
    citySelector.init();

    //0801首页头部新老用户领券
    (function () {
        function getCoupon() {
            loading.show();
            $.ajax({
                url: '/mobile/topic/s2019/3_getCoupons/index.php?switch=Getcoupon',
                type: 'get',
                dataType: 'json',
                success: function (res) {
                    loading.hide();
                    //领取成功
                    if (res.code == 0) {
                        $('.result_img').addClass('hide');
                        // 老用户
                        if (res.user === 'old') {
                            $('.result_1').removeClass('hide').parents('section').removeClass('hide');

                            if (res.user === 'old' && res.is_get === 1) {
                                $('.result_2').removeClass('hide').parents('section').removeClass('hide').find('.category').css({
                                    bottom: '29%'
                                }).siblings('.coupon_list').css({
                                    bottom: '59%'
                                });
                            }
                        }
                        // 新用户 已领过
                        if (res.user === 'new' && res.is_get === 1) {
                            $('.result_2').removeClass('hide').parents('section').removeClass('hide').find('.category').css({
                                bottom: '29%'
                            }).siblings('.coupon_list').css({
                                bottom: '59%'
                            });
                            return;
                        }
                        // 新用户 领券成功
                        if (res.user === 'new') {
                            if (res.in_area === 1) {
                                //华南华北 新用户：80蛋糕立减券
                                $('.result_3').removeClass('hide').parents('section').removeClass('hide');

                            } else if (res.in_area === 2) {
                                // 华西 新用户:80蛋糕立减券+20元吐司立减券
                                $('.result_3').removeClass('hide').parents('section').removeClass('hide');
                            } else {
                                //华东 新用户:80蛋糕立减券+20元吐司套餐立减券+20元吐司立减券
                                $('.result_3').removeClass('hide').parents('section').removeClass('hide');
                            }
                        }
                    } else {
                        $.toast('领取失败');
                    }
                },
                error: function () {
                    loading.hide();
                    $.toast('领取失败');
                }
            });
        }

        loginObj.successFn = function (data) {
            window.customerInfo = data;
            loginObj.isShow = 0;
            getCoupon();
        };
        $('.coupon_header').click(function () {
            var currentCustomer = customerInfo['custID'];
            if (currentCustomer) {
                var confirm = $.confirm('当前登录用户为' + currentCustomer + '，确认领券？',
                    function () {
                    },
                    {
                        title: '提示',
                        confirmText: '确定',
                        cancelText: '切换账号',
                        initFn: function () {
                            $('.dialog_pop .cover').click(function () {
                                confirm.hide();
                            });
                        },
                        cancelFn: function () {
                            confirm.hide();
                            loginObj.isShow = 1;
                        },
                        confirmFn: function () {
                            confirm.hide();
                            getCoupon();
                        }
                    });
            } else {
                loginObj.isShow = 1;
            }
        });
        $('.close_btn').click(function () {
            $(this).parents('section').addClass('hide');
        });
        $('#couponForm .cover,#couponResult .cover').click(function () {
            $(this).parents('section').addClass('hide');
        });
    })();

    //数字蛋糕浮动
    (function () {
        setTimeout(function () {
            $('#globalSlideCalendar .inner').toggleClass('active');
        }, 500);

        $('#globalSlideCalendar .small').click(function () {
            $(this).removeClass('active');
            $('#globalSlideCalendar .big').addClass('active');
        });
    })();

    $('.slideLazy').lazyload({
        effect: 'fadeIn',
        container: $('.comment_list')
    });

    //2018.08.08 情人节弹窗
    (function () {
        var plat = 'h5',
            flag = 'activity_180808',
            key = flag + '_' + plat,
            clearKey = 'clear_' + key;
        if (utils.getQuery(clearKey)) {
            sessionStorage.removeItem(key);
        }
        var val = sessionStorage.getItem(key);
        if (!val) {
            sessionStorage.setItem(key, 'isSet');
            var dom = $('.' + flag);
            dom.removeClass('hide').find('.close_btn').click(function () {
                dom.remove();
            });
        }
    })();

    //2018.09.15 广东台风提示
    (function () {
        var cityAlias = cookie.get('CITY_ALIAS');
        if (cityAlias === 'SH') {
            $("#marquee").removeClass('hide').marquee({duration: 8000, delayBeforeStart: 0});
        }
    })();

    //2018.11.06 领券
    (function () {
        var plat = 'h5',
            flag = 'activity_181106',
            key = flag + '_' + plat,
            clearKey = 'clear_' + key;
        if (utils.getQuery(clearKey)) {
            localStorage.removeItem(key);
        }
        var val = localStorage.getItem(key);
        if (!val) {
            localStorage.setItem(key, 'isSet');
            var dom = $('.' + flag);
            dom.removeClass('hide').click(function () {
                dom.remove();
            }).find('.div_img').click(function (e) {
                e.stopPropagation();
            }).find('.close_btn').click(function () {
                dom.remove();
            });
            setTimeout(function () {
                dom.remove();
            }, 10000);
        }
    })();

    //重庆首页
    (function () {
        // 重庆 积分兑换
        if ($('#integration').length) {
            homeVue = new Vue({
                el: '#integration',
                data: {
                    userInfo: {}, // 当前登录用户信息
                    selectedInterGoodsId: 0,
                    leclubGoodsList: []  // 积分商品列表
                },
                mounted: function () {
                    var self = this;
                    this.userInfo = user_center || {};
                    this.leclubGoodsList = this.createList(leclubGoodsList) || [];

                    if (this.leclubGoodsList.length) {
                        this.selectedInterGoodsId = this.leclubGoodsList[0].postId;
                    }

                    // 重庆 积分兑换轮播
                    if ($('#integrationSwiper .swiper-wrapper li').length > 1) {
                        new Swiper('#integrationSwiper', {
                            speed: 800,
                            loop: false,
                            nextButton: '#integrationSwiper .swiper-button-next',
                            prevButton: '#integrationSwiper .swiper-button-prev',
                            onSlideChangeEnd: function () {
                                //获取内容文本
                                var uid = $('#integrationSwiper .swiper-slide-active').attr('data-uid');
                                if (homeVue) {
                                    homeVue.selectedInterGoodsId = uid;
                                }

                            }
                        })
                    }
                },
                computed: {
                    selectedInterGoods: function () {
                        var self = this;
                        var selectItems = this.leclubGoodsList.filter(function (item) {
                            return item.postId == self.selectedInterGoodsId;
                        });
                        if (selectItems && selectItems.length) {
                            return selectItems[0];
                        }
                    },
                    ifDuihuan: function () {
                        var self = this;
                        var canDuihuan = false;
                        if (self.selectedInterGoods && self.userInfo) {
                            self.selectedInterGoods.detail.rankList.forEach(function (item) {
                                if (self.userInfo.rankId == item.rankId && self.userInfo.points > item.points) {
                                    canDuihuan = true;
                                }
                            });
                        }
                        return canDuihuan;
                    }
                },
                methods: {
                    duihuan: function () {
                        var postId = this.selectedInterGoods.postId, ifDuihuan = this.ifDuihuan;
                        if (!this.userInfo.rankName) {
                            location.href = '/h5/customer/login';
                        } else if (ifDuihuan) {
                            var params = [
                                {
                                    sku_id: postId,
                                    amount: 1
                                }
                            ];
                            app_js.buyItem(params, null, false, {
                                success: function (data) {
                                    $.confirm('兑换成功', null, {
                                        cancelText: '知道了',
                                        confirmText: '去购物车结算', confirmFn: function () {
                                            location.href = '/h5/cart';
                                        }
                                    });
                                }
                            });
                        }
                    },
                    //处理对象为数组
                    createList: function (obj) {
                        var list = [],
                            sizeArray = obj;
                        for (var i in sizeArray) {
                            if (sizeArray.hasOwnProperty(i)) {
                                var o = {postId: i, detail: sizeArray[i]};
                                list.push(o);
                            }
                        }
                        return list;
                    }
                }
            });
        }

        if ($('.nav_section').length) {
            var keys = ['gift', 'cakeCard', 'welfare', 'points'],
                sections = keys.map(function (item) {
                    var dom = $('[data-section="' + item + '"]');
                    return {
                        key: item,
                        dom: dom,
                        top: dom.offset().top
                    };
                });
            $('#home').append($('.nav_section').clone(true).addClass('fix_nav'));
            $(document).on('click', '.nav_section a', function () {
                var me = $(this),
                    target = me.attr('data-target');
                var idx = $.inArray(target, keys),
                    curSection = sections[idx];
                $('[data-target="' + curSection.key + '"]').parent().addClass('active').siblings().removeClass('active');
                $('html,body').animate({scrollTop: curSection.top - 60});
            });
            $(window).scroll(function () {
                var winTop = $(window).scrollTop(), scrollTop = $('.banner_wrap').outerHeight() + 100;
                if (winTop > scrollTop) {
                    $('.nav_section.fix_nav').addClass('active');
                } else {
                    $('.nav_section.fix_nav').removeClass('active');
                }
                sections.forEach(function (item) {
                    if (item.top - 90 < winTop) {
                        $('[data-target="' + item.key + '"]').parent().addClass('active').siblings().removeClass('active');
                    }
                });
            });
        }
    })();

    //北京点击牛奶banner同时购买牛奶和喵叽叽蛋糕
    (function () {
        var arr = [111290, 111449];
        if (GlobalConfig.site_env === 'dev' || GlobalConfig.site_env === 'alpha') {
            arr = [100801, 107415];
        }
        $(document).on('click', '#buyMilkInBj', function () {
            app_js.buyItem([
                {
                    sku_id: arr[0],
                    amount: 1,
                    checked: 1
                },
                {
                    sku_id: arr[1],
                    amount: 1,
                    checked: 1
                }
            ]);
        });
    })();
});