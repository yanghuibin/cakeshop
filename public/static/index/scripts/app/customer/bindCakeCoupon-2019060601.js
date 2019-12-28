var custID = customerInfo.custID;

var app = new Vue({
    el: '#form',
    data: {
        card_no: '',
        card_passwd: '',
        yzm: '',
        captchaImg: GlobalConfig.staticUrl + '/images/grey.gif',                     //图形验证码图片
    },
    mounted: function () {
        this.getCaptcha();
    },
    methods: {
        //获取图形验证码
        getCaptcha: function () {
            var self = this,
                currentApp = self.currentApp;
            var url = '/customer/captcha.html?w=80&h=30&offset=2';
            $.get(url + '&refresh=true', function () {
                self.captchaImg = url + '&v=' + Math.random();
            });
        },
        submit: function () {
            var self = this,
                card_no = this.card_no,
                card_passwd = this.card_passwd,
                yzm = this.yzm;
            if (!card_no) {
                $.toast('请输入蛋糕券号后4位');
                return;
            }
            if (!card_passwd) {
                $.toast('请输入密码');
                return;
            }
            if (!yzm) {
                $.toast('请输入验证码');
                return;
            }
            $.confirm('尾号' + card_no + '蛋糕券即将绑定至账户' + custID + '，确认绑定后不可更改取消。是否确认绑定激活？', null, {
                confirmText: '确认',
                cancelText: '取消',
                cancelFn: function () {
                    $.removeDialog();
                },
                confirmFn: function () {
                    $.removeDialog();
                    loading.show();
                    $.ajax({
                        method: 'post',
                        url: '/customer/operate-cake-coupon.html',
                        data: {
                            action: 'bind',
                            card_no: card_no,
                            card_passwd: card_passwd,
                            yzm: yzm
                        },
                        dataType: 'json'
                    }).done(function (res) {
                        if (res.error === 103) {
                            $('#activeStoreCardPop').removeClass('hide');
                            return;
                        }
                        if (res.error === 0) {
                            location.href='/h5/customer/bind-cake-coupon-success';
                        } else {
                            $.alert(res.msg);
                        }
                    }).fail(function () {
                        $.toast('请求失败，请重试');
                    }).always(function () {
                        self.getCaptcha();
                        loading.hide();
                    });
                }
            });
        }
    }
});
$(function () {
    loginObj.successFn = function () {
        custID = res.custID;
        loginObj.isShow = false;
    };
});
