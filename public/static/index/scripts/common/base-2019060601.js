//工具函数对象
var utils = {
    checkPassword: function (val) {
        return /^[A-Za-z0-9_-]{6,20}$/.test(val);
    },
    //检查邮箱
    checkEmail: function (email) {
        return /^[\w-]+(\.[\w-]+)*@[A-Za-z0-9]+((.|-|_)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(email);
    },
    //检查手机号
    checkMobile: function (mobile) {
        return /^1\d{10}$/.test(mobile);
    },
    //返回'00'类字符串
    subTime: function (str_time) {
        if (str_time < 10) {
            str_time = '0' + str_time;
        }
        return str_time + '';
    },
    //判断移动设备
    isMobile: {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        IOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        QQ: function () {
            return navigator.userAgent.match(/QQ/i);
        },
        Wechat: function () {
            return navigator.userAgent.match(/MicroMessenger/i);
        },
        Alipay: function () {
            return navigator.userAgent.match(/AlipayClient/i);
        },
        APP: function () {
            return navigator.userAgent.match(/lecake/i);
        }
    },
    checkIsMiniProgram: function (success, fail, beforeFn, afterFn) {
        beforeFn && beforeFn();
        if (!utils.isMobile.Wechat()) {
            fail && fail();
            afterFn && afterFn();
        } else {
            wx.miniProgram.getEnv(function (res) {
                if (res.miniprogram) {
                    success && success();
                } else {
                    fail && fail();
                }
                afterFn && afterFn();
            });
        }
    },
    //格式化货币单位
    currency: function (price, separate) {
        var f = parseFloat(price);
        if (isNaN(f)) {
            return 0;
        }
        f = Math.round(f * 100) / 100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        if (separate) {
            return s.split('.');
        }
        return s;
    },
    //异步加载js
    asyncLoadJS: function (url) {
        var headObj = document.getElementsByTagName('HEAD').item(0);
        var scriptObj = document.createElement('script');
        scriptObj.type = 'text/javascript';
        scriptObj.src = url;
        headObj.appendChild(scriptObj);
    },
    //格式化日期
    formatDate: function (time, fmt) {
        time = time || Date.now();
        fmt = fmt || 'yyyy-MM-dd hh:mm:ss';
        var date = new Date(time);
        var o = {
            'M+': date.getMonth() + 1, //月份
            'd+': date.getDate(), //日
            'h+': date.getHours(), //小时
            'm+': date.getMinutes(), //分
            's+': date.getSeconds(), //秒
            'q+': Math.floor((date.getMonth() + 3) / 3), //季度
            'S': date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    },
    //获取中文星期
    getDay: function (time, prefix) {
        time = time || Date.now();
        prefix = prefix || '周';
        var str = '日一二三四五六';
        return prefix + str[new Date(time).getDay()];
    },
    //获取查询参数
    getQuery: function (name, url) {
        var u = arguments[1] || window.location.search,
            reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'),
            r = u.substr(u.indexOf('\?') + 1).match(reg);
        return r !== null ? r[2] : '';
    },
    //获取除hash外location
    getHref: function () {
        return location.href.split('#')[0];
    },
    //获取location.origin
    getOrigin: function () {
        return location.protocol + '//' + location.hostname;
    },
    //获取location.origin
    checkProtocol: function (url) {
        return url.indexOf('http') === -1 ? location.protocol + url : url;
    },
    //获取字符串长度，区分中英文
    len: function (str) {
        var len = 0,
            a = str.split('');
        for (var i = 0; i < a.length; i++) {
            if (a[i].charCodeAt(0) < 299) {
                len++;
            } else {
                len += 2;
            }
        }
        return len;
    },
    //检查详细地址和门牌号
    checkAddress: function (str, min, max) {
        if (str.length < min || str.length > max) {
            return false;
        }
        return !/[~!@#$%^&*\\|"']/.test(str);
    },
    //判断对象类型
    isType: function (o, type) {
        var types = [
                ['number', 'Number'],
                ['string', 'String'],
                ['undefined', 'Undefined'],
                ['bool', 'Boolean'],
                ['object', 'Object'],
                ['array', 'Array'],
                ['function', 'Function'],
                ['null', 'Null']
            ],
            current = [];
        for (var i = 0; i < types.length; i++) {
            if (types[i][0] === type) {
                current = types[i];
            }
        }
        if (!current.length) {
            throw new Error('类型不存在');
        }
        return Object.prototype.toString.call(o) === '[object ' + current[1] + ']';
    },
    //获取uuid
    uuid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    //获取[min, max]
    rand: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    //根据新参数重构url searchObj={key:val}
    createUrl: function (searchObj) {
        searchObj = searchObj || {};
        var search = location.search.split('?')[1],
            hash = location.hash,
            params = [],
            searchArr = [],
            newSearchArr = [],
            searchStr;
        if (search) {
            search.split('&').forEach(function (item) {
                params = item.split('=');
                searchArr.push([params[0], params[1]]);
            });
        }
        searchArr.forEach(function (arr) {
            if (searchObj.hasOwnProperty(arr[0])) {
                arr[1] = searchObj[arr[0]];
            }
            newSearchArr.push(arr);
        });
        var keyArray = searchArr.map(function (item) {
            return item[0];
        });
        for (var key in searchObj) {
            if (searchObj.hasOwnProperty(key) && $.inArray(key, keyArray) === -1) {
                newSearchArr.push([key, searchObj[key]]);
            }
        }
        searchStr = newSearchArr.reduce(function (prevVal, currentArr) {
            return (prevVal ? prevVal + '&' : '') + currentArr.join('=');
        }, '');
        return location.origin + location.pathname + '?' + searchStr + hash;
    },
    //传入图片路径，返回base64
    createBase64: function (imgUrl) {
        function getBase64Image(img, width, height) {
            var canvas = document.createElement("canvas");
            canvas.width = width ? width : img.width;
            canvas.height = height ? height : img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL();
        }

        var image = new Image();
        image.crossOrigin = '';
        image.src = imgUrl;
        var deferred = $.Deferred();
        if (imgUrl) {
            image.onload = function () {
                deferred.resolve(getBase64Image(image));
            };
            return deferred.promise();
        }
    },
    //数组去重
    uniqueArray: function (arr) {
        arr = arr || [];
        arr.sort();
        var temp = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] !== temp[temp.length - 1]) {
                temp.push(arr[i]);
            }
        }
        return temp;
    }
};

//cookie相关操作
var cookie = {
    //设置cookie，time为秒数
    set: function (key, val, time) {
        var exp = new Date();
        exp.setTime(exp.getTime() + time * 1000);
        if (!time) {
            document.cookie = key + '=' + encodeURIComponent(val) + ';path=/;domain=' + GlobalConfig.cookieDomain + ';';
        } else {
            document.cookie = key + '=' + encodeURIComponent(val) + ';expires=' + exp.toGMTString() + ';path=/;domain=' + GlobalConfig.cookieDomain + ';';
        }
    },
    get: function (key) {
        var cookieArr = document.cookie.split('; ');
        var arr, val = null;
        for (var i = 0; i < cookieArr.length; i++) {
            arr = cookieArr[i].split('=');
            if (key === arr[0]) {
                val = decodeURIComponent(decodeURIComponent(arr[1]));
                break;
            }
        }
        return val;
    },
    delete: function (key) {
        var val = this.get(key);
        if (val !== null) {
            this.set(key, null, -10000000);
        }
    }
};

//购物车相关操作
var globalCart = {
    //单个商品编辑购物车,构造如['sku_id'=>102025,'amount'=>2,'attributes'=>['goods_cut'=>0,'goods_birthday'=>'']]的格式,amount为0时为删除
    //obj = {sku_id:int,amount:int,attributes:array,success:fn,fail:fn,always:fn} || {params:[{sku_id:int,amount:int,attributes:array}],success:fn,fail:fn,always:fn}
    update: function (obj, isAdd) {
        var params,
            itemInfo;
        if (!obj.params) {
            itemInfo = {
                sku_id: obj.sku_id,
                amount: utils.isType(obj.amount, 'undefined') ? 1 : obj.amount,
                checked: obj.checked,
                use_bargain_id: obj.use_bargain_id
            };
            if (obj.attributes) {
                itemInfo.attributes = obj.attributes;
            }
            params = [itemInfo];
        } else {
            params = obj.params;
        }
        var url = isAdd ? '/h5/cart/add-new' : '/h5/cart/update-new';
        params.forEach(function (item) {
            var attributes = item.attributes;
            if (utils.isType(item.attributes, 'object')) {
                if (!utils.isType(attributes.toastCycleList, 'undefined')) {
                    if (!attributes.toastCycleList) {
                        attributes.toastCycleList = [];
                    }
                }
            }
        });
        $.ajax({
            method: 'post',
            url: url,
            data: {
                params: params
            }
        }).done(function (res) {
            if (res.error === 0) {
                //更新全局购物车数量
                globalCart.count();
                obj.success && obj.success(res.data);
            } else {
                obj.fail && obj.fail(res.msg);
            }
        }).fail(function () {
            obj.fail && obj.fail('编辑购物车失败');
        }).always(function (res) {
            obj.always && obj.always(res);
        });
    },
    //全局购物车数量
    count: function (dom) {
        dom = dom || $('#globalCartNum');
        var num = cookie.get('CARTCNT');
        if (num && parseInt(num) > 0) {
            dom.text(parseInt(num)).removeClass('hide');
        } else {
            dom.text(0).addClass('hide');
        }
    }
};

var timeHandler = {
    //时间戳=>100000
    timeToInt: function (time) {
        time = this.strToInt(time);
        var t = utils.formatDate(time, 'hh:mm');
        return parseInt(t.split(':').join('')) * 100;
    },
    //10:00:00=>时间戳
    strToInt: function (time) {
        var str;
        if (typeof time === 'number') {
            time = time.toString();
            str = time.substring(0, 2) + ':' + time.substring(2, 4);
        } else {
            str = time;
        }
        str = str || '10:00:00';
        var startArr = str.split(':').map(function (item) {
            return parseInt(item);
        });
        return ((startArr[0] + new Date().getTimezoneOffset() / 60) * 3600 + startArr[1] * 60) * 1000;
    },
    //100000=>10:00:00
    intToStr: function (time, isShort) {
        time = time || 100000;
        time = time.toString();
        return time.substring(0, 2) + ':' + time.substring(2, 4) + (isShort ? '' : ':' + time.substring(4, 6));
    },
    //10:00:00=>100000
    timeToNumber: function (time) {
        time = time || '10:00:00';
        return parseInt(time.replace(/:/g, ''));
    },
    //将2017-00-00转化为时间戳
    dateToInt: function (date) {
        date = date || '2017-00-00';
        return new Date(date.split('-').map(function (item) {
            return parseInt(item);
        }).join('/')).getTime();
    }
};
//跳转到结算页
var globalToOrder = function (buyId, activity) {
    window.location = '/h5/order?buyId=' + buyId + '&activity=' + activity;
};
//微信相关
var globalWechat = {
    share: function (opt) {
        opt = $.extend({
            title: '', // 分享标题
            desc: '', // 分享描述
            link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: '', // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        }, opt);
        if (utils.isMobile.Wechat()) {
            wx.ready(function () {
                wx.onMenuShareTimeline(opt);
                wx.onMenuShareAppMessage(opt);
            });
        }
    }
};

//判断商品类型
function getGoodsType(typeId) {
    typeId = parseInt(typeId);
    var type;
    switch (typeId) {
        case 1:
            type = '蛋糕';
            break;
        case 2:
            type = '配件';
            break;
        case 3:
            type = '特殊配件';
            break;
        case 21:
            type = '预生产类';
            break;
        case 23:
            type = '虚拟商品';
            break;
        default:
            type = '其他';
    }
    return type;
}

//混淆订单号
function mixOrderNo(no) {
    no = no || '';
    var last = no.substr(-6).split('').reverse().join('');
    return no.substr(0, 12) + last;
}

//支付对象
var globalPayment = {
    orderId: '',
    wxBody: '',
    totalPrice: '',
    isWx: false,
    //支付宝
    alyPay: function () {
        var custom_url = encodeURIComponent('/shop/wechat/usercenter/member_order.php?orderflg=1'),
            show_url = encodeURIComponent('http://www.lecake.com/shop/wechat/usercenter/member_order.php'),
            redirect_url = '/shop/onlinepay/alipay_wap/send.php?bill_no=' + this.orderId + '&amount=' + this.totalPrice + '&custom_url=' + custom_url + '&show_url=' + show_url;
        if (!this.isWx) {
            location.replace(redirect_url);
        } else {
            location.replace('/shop/wechat/3rdpartypay.php?type=alipay&bill_no=' + this.orderId + '&redirect=' + encodeURIComponent(redirect_url));
        }
    },
    //银联
    unionPay: function () {
        location.replace('/shop/onlinepay/unionpay/send.php?source=wechat&bill_no=' + this.orderId + '&amount=' + this.totalPrice);
    },
    //微信
    wxPay: function () {
        location.replace('/shop/onlinepay/wx/jsapicall.php?wx_out_trade_no=' + this.orderId + '&wx_body=' + this.wxBody + '&wx_total_fee=' + this.totalPrice + '&showwxpaytitle=1');
    },
    //农行k码
    abc_kPay: function () {
        location.replace('/shop/onlinepay/abccc/send_k.php?bill_no=' + this.orderId);
    },
    //苏州农行
    abc_mPay: function () {
        var redirect_url = '/shop/onlinepay/abcm/send.php?bill_no=' + this.orderId + '&amount=' + this.totalPrice;
        if (!this.isWx) {
            location.replace(redirect_url);
        } else {
            location.replace('/shop/wechat/3rdpartypay.php?type=abcmpay&bill_no=' + this.orderId + '&redirect=' + encodeURIComponent(redirect_url));
        }
    },
    //招行一网通
    cmbPay: function () {
        location.replace('/shop/bill_pay.php?bill_no=' + this.orderId + '&payTypeID=98');
    },
    //建行龙支付
    cbcPay: function () {
        var redirect_url = '/shop/onlinepay/cbc/send.php?bill_no=' + this.orderId + '&amount=' + this.totalPrice;
        if (!this.isWx) {
            location.replace(redirect_url);
        } else {
            location.replace('/shop/wechat/3rdpartypay.php?type=cbcpay&bill_no=' + this.orderId + '&redirect=' + encodeURIComponent(redirect_url));
        }
    },
    //浦发银行
    spdbPay: function () {
        location.replace('/shop/onlinepay/spdb/send.php?bill_no=' + this.orderId + '&total_money=' + this.totalPrice);
    },
    //壹钱包
    yqbPay: function () {
        location.replace('/shop/onlinepay/oneqianbao/send.php?bill_no=' + this.orderId + '&amount=' + this.totalPrice);
    },
    //浦发快捷支付银行
    spdbQuickPay: function () {
        location.replace('/h5/pay?bill_no=' + this.orderId + '&total_money=' + this.totalPrice);
    },
    //交通银行快捷支付
    bocomQuickPay: function () {
        location.replace('/h5/pay?bill_no=' + this.orderId + '&total_money=' + this.totalPrice);
    },
    //华瑞银行
    shrbPay: function () {
        location.replace('/h5/pay/online-pay?bill_no=' + this.orderId);
    },
    //调用支付
    doPay: function (id) {
        id = parseInt(id);
        var types = [[8, 'aly'], [29, 'wx'], [96, 'union'], [59, 'abc_k'], [97, 'abc_m'], [98, 'cmb'], [99, 'cbc'], [48, 'yqb'], [49, 'spdb'], [107, 'spdbQuick'], [108, 'bocomQuick'], [102, 'shrb']],
            current = '';
        for (var i = 0; i < types.length; i++) {
            if (id === types[i][0]) {
                current = types[i][1];
            }
        }
        if (current) {
            globalPayment[current + 'Pay']();
        } else {
            location.replace('/shop/wechat/usercenter/payment.php?bill_no=' + this.orderId);
        }
    },
    //支付
    pay: function (payId, orderId, totalPrice, wxBody) {
        wxBody = wxBody || '微信支付';
        this.isWx = utils.isMobile.Wechat();
        this.orderId = orderId;
        this.totalPrice = totalPrice;
        this.wxBody = wxBody;
        this.doPay(payId);
    }
};

//兼容活动页写法
var app_js = {
    /**
     * 购买商品函数，
     * @param sku_id 商品SKU ID
     * @param amount  数量 默认1
     * @param quickBuyFlag true OR false, default false 购买成功后是否直接跳转结算页
     * @param fn   购买结果回调
     */
    buyItem: function (sku_id, amount, quickBuyFlag, fn) {
        var params = [];
        amount = amount || 1;
        fn = fn || {};
        if (utils.isType(sku_id, 'array')) {
            //代表是id数组
            params = sku_id;
        } else {
            if (!sku_id) {
                $.toast("添加购物车失败！（未输入商品ID）");
                return;
            }
            params.push({
                sku_id: sku_id,
                amount: amount,
                checked: 1
            });
        }
        if (quickBuyFlag) {
            var miniProgramFlag = 0;
            utils.checkIsMiniProgram(function () {
                miniProgramFlag = 1;
            }, function () {
                miniProgramFlag = -1;
            }, null, function () {
                app_js.doQuickBuy(params, miniProgramFlag, fn);
            });
        } else {
            globalCart.update({
                params: params,
                always: function () {
                    fn.always && fn.always();
                },
                success: function (res) {
                    if (fn.success) {
                        fn.success(res);
                    } else {
                        window.location = '/h5/cart';
                    }
                },
                fail: function (msg) {
                    if (fn.fail) {
                        fn.fail(msg);
                    } else {
                        $.alert(msg);
                    }
                }
            }, true);
        }
    },
    //立即购买函数
    doQuickBuy: function (params, miniProgramFlag, fn) {
        $.ajax({
            method: 'get',
            url: '/h5/cart/to-order',
            data: {
                params: params,
                miniProgramFlag: miniProgramFlag
            }
        }).done(function (res) {
            if (res.error === 0) {
                if (fn.success) {
                    fn.success(res.data);
                } else {
                    //跳转结算页
                    window.location = '/h5/order?buyId=' + res.data.buyId;
                }
            } else {
                if (fn.fail) {
                    fn.fail(res.msg);
                } else {
                    $.alert(res.msg);
                }
            }
        }).fail(function () {
            if (fn.fail) {
                fn.fail('提交失败，请重试');
            } else {
                $.alert('提交失败，请重试');
            }
        }).always(function () {
            fn.always && fn.always();
        });
    }
};
//购买后直接升级aha会员的商品
var globalBuyVipGoods = 111043;

if (GlobalConfig.site_env === 'dev' || GlobalConfig.site_env === 'alpha') {
    globalBuyVipGoods = 108003;
}

//全局页面初始化
$(function () {
    //页面加载完成后全局调用
    globalCart.count();
    //禁止触摸滚动
    $(document).on('touchmove', '.no_touch', function (e) {
        e.preventDefault();
    });
    //加入购物车通用处理
    $(document).on('click', '[buy-item]', function () {
        loading.show();
        var me = $(this),
            id = me.attr('data-id'),
            amount = me.attr('data-amount'),
            action = me.attr('data-action');
        amount = parseInt(amount) || 1;
        globalCart.update({
            sku_id: id,
            amount: amount,
            checked: 1,
            always: function () {
                loading.hide();
            }
        }, action === 'add');
    });

    //需要在小程序中添加导航的页面
    (function () {
        utils.checkIsMiniProgram(function () {
            if ($('.main_pass_card_status').length || $('.main_order').length || $('.main_coupons_history').length || $('.main_coupons').length) {
                miniProgramNav.init();
            }
        });
    })();

    //购买aha商品
    (function () {
        $(document).on('click', '.global_buy_vip_goods', function () {
            app_js.buyItem(globalBuyVipGoods, 1, true);
        });
    })();

    //aha权益介绍
    (function () {
        var html = $('<article class="global_vip_rule">\n' +
            '    <div class="wrap">\n' +
            '        <a href="javascript:void(0)" class="close_btn">关闭</a>\n' +
            '        <div class="inner">\n' +
            '            <h3> 诺心为向用户提供更高品质的客户服务，特别推出aha会员专属权益。</h3>\n' +
            '            <h3> 【激活aha会员】</h3>\n' +
            '            <p>用户可在诺心官网通过以下任一方式激活aha会员：</p>\n' +
            '            <p>1. 付费激活：支付199元aha会员费，可获得1年aha会员权益。</p>\n' +
            '            <p>2. 0元激活：收到诺心邀请，完善生日信息并邀请非aha会员的好友注册或登录。</p>\n' +
            '            <p class="distance">3.受邀激活：完成aha会员对你发出的点亮任务邀请</p>\n' +
            '            <h3>【aha会员权益】</h3>\n' +
            '            <p>成功激活aha会员的用户可享受如下权益：</p>\n' +
            '            <p>1. 专享会员价：凡标有aha会员标签的商品，会员下单可享受aha会员价，可与aha专属优惠券与aha值优惠同享（其他优惠除外，如促销、普通会员优惠券、蛋糕券、储值卡、专享兑换券、银行优惠等不可同享）。</p>\n' +
            '            <p>2. aha专享优惠券：成为aha会员即可获得会员专属优惠券。 </p>\n' +
            '            <p>3.\n' +
            '                 aha值返利：单笔蛋糕订单实付满178元（不含运费）可享aha值返利，每实付10元累计1aha值，aha值可直接抵扣蛋糕、礼品、配件费用（不含运费、第三方配送商品费用），1aha值=1元，现有积分和aha值可同时获取累计，但不可同时使用、不可提现。（ aha值48小时内到账，实付金额特指微信支付、支付宝支付、货到付款和银行卡支付）。</p>\n' +
            '            <p> 4. aha蛋糕狂欢节：aha会员每月拥有专属蛋糕狂欢节，在狂欢节期间享受人气蛋糕超值狂欢价。</p>\n' +
            '            <p>5. 会员尝鲜权：aha会员享有邀请好友一起品尝诺心新品蛋糕的特权。用户可通过活动页面参与，邀请满9名好友即可免费品尝新品。</p>\n' +
            '            <p class="distance">6. 其他权益：其他惊喜会员活动敬请期待。</p>\n' +
            '            <h3>【aha会员有效期】</h3>\n' +
            '            <p class="distance">aha会员权益激活后即刻生效，有效期至多1年；aha会员如过期，可通过支付会员费重新激活。</p>\n' +
            '            <h3>【延长有效期】</h3>\n' +
            '            <p>1. 续费：aha会员权益过期后可续费重新激活，有效期为1年。</p>\n' +
            '            <p class="distance">2.\n' +
            '                 下单： 如aha会员初始有效期不足1年，在有效期内下单 （蛋糕、吐司等诺心自营商品），可延长6个月有效期， 直至有效期延长至1年（自会员激活之日起）。</p>\n' +
            '            <h3> 温馨提示：</h3>\n' +
            '            <p> 1. 延长有效期的订单需在aha会员有效期内完成下单，订单需采用线上现金支付（不支持蛋糕券、储值卡、专享兑换券等支付方式）。</p>\n' +
            '            <p> 2. 如发生退货拒收等情形，延长的有效期将取消，如取消后会员已过期，aha会员权益终止，用户自动恢复为普通会员身份。</p>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '</article>');
        $(document).on('click', '.global_show_vip_rule', function () {
            html.appendTo($('body')).click(function () {
                $('.global_vip_rule').remove();
            }).find('.close_btn').click(function () {
                $('.global_vip_rule').remove();
            }).end().find('.wrap').click(function (e) {
                e.stopPropagation();
            });
        });
    })();

    //客服
    /*$(document).on('click', '#serviceBtn,#footerServiceBtn', function () {
    //    try {
    //        window.location = '//webchat.7moor.com/wapchat.html?accessId=94ffd220-4ea3-11e9-874c-d90fda97278e&fromUrl=' + encodeURIComponent(location.href) + '&urlTitle=' + encodeURIComponent(document.title);
        } catch (e) {
            console.error(e);
        }
    });
});
*/

//2018.11.06 领券
    function showOnlyOnePop(flag, callback) {
        var plat = 'h5',
            key = flag + '_' + plat,
            clearKey = 'clear_' + key;
        if (utils.getQuery(clearKey)) {
            localStorage.removeItem(key);
        }
        var val = localStorage.getItem(key);
        if (!val) {
            localStorage.setItem(key, 'isSet');
            var dom = $('.' + flag);
            callback && callback(dom);
        }
    }

    /**
     * 处理iOS 微信客户端6.7.4 键盘收起页面未下移bug
     */
    (function () {
        if (/iphone|ipod|ipad/i.test(navigator.appVersion)) {
            document.addEventListener('blur', function (e) {
                var name = e.target.localName;
                if (name === 'input' || name === 'textarea') {
                    if (typeof window.isNotNeedFixInputError === "undefined") {
                        document.body.scrollTop = document.body.scrollTop;
                    }
                }
            }, true);
        }
    })();

//session 弹窗
    function showSessionPop(flag, closeByCover, callback) {
        var plat = 'h5',
            key = flag + '_' + plat,
            clearKey = 'clear_' + key;
        if (utils.getQuery(clearKey)) {
            sessionStorage.removeItem(key);
        }
        var val = sessionStorage.getItem(key);
        if (!val) {
            sessionStorage.setItem(key, 'isSet');
            var dom = $('.' + flag);
            dom.removeClass('hide');
            dom.find('.close_btn').click(function () {
                dom.remove();
            }).end().find('.div_img').click(function (e) {
                e.stopPropagation();
            });

            if (closeByCover) {
                dom.click(function () {
                    dom.remove();
                });
            }
            callback && callback(dom);
        }
    }

//促销类型对应的标签文字
    var PROMOTION_TYPE = {
        DEDUCT: '满减',
        SPECIAL_OFFER: '特价',
        FREE_FREIGHT: '免运费',
        POINT: '积分活动',
        GIFT: '赠品',
        SUIT: '套装',
        DISCOUNT: '满折',
        UPGRADE_POUNDS: '升磅',
        DEDUCT_GIFT: '满减&赠品'
    };