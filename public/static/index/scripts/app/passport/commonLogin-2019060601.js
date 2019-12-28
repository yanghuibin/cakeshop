var loginObj = new Vue({
    el: '#loginPop',
    data: {
        isShow: false,
        mobile: '',
        code: '',
        yzm: '',                 //写死图形验证码
        time: 0,
        isCodeGetting: false,
        customerSource: 14,
        isFetching: false,
        isUnbinding: false,         //是否正在解绑
        showConfirm: false,         //是否显示confirm
        showAlert: false,            //是否显示alert
        selectedMobile: '',         //选择要绑定的手机号
        custID: '',                 //解绑使用的用户uid
        bind: '',                   //调用bind或unbind的标识
        mobileList: [],              //多账号的手机列表
        successFn: null,            //登录成功回调
        beforeLogin: null,            //登录前调用
        loginComplete: null,         //登录结束调用
        isYzm: '0'                    //0传随机码，1传图片验证码
    },
    created: function () {
        var isYzm = $('#__common_login_isYzm').val(),
            yzm = $('#__common_login_yzm').val();
        this.isYzm = isYzm;
        this.yzm = yzm;
        this.isShow = parseInt($('#__common_login_isShow').val()) === 1;
        if (isYzm === '1') {
            this.yzm = '';
        }
    },
    mounted: function () {
        this.getCaptcha();
    },
    methods: {
        //获取图形验证码
        getCaptcha: function () {
            var img = $('#captchaImg'),
                url = img.attr('data-src');
            if (!img.length) {
                return;
            }
            var pos = url.indexOf('&v=');
            url = pos === -1 ? url : url.substring(0, pos);
            $.get(url + '&refresh=true', function () {
                img.attr('src', url + '&v=' + Math.random());
            });
        },
        sendSMS: function () {
            var self = this,
                mobile = self.mobile;
            if (!self.checkMobile(mobile)) {
                return;
            }
            var yzm = self.isYzm === '1' ? self.yzm : self.yzm.split('').reverse().join('');
            if (!yzm) {
                $.toast('请输入图形验证码');
                return;
            }
            self.isCodeGetting = true;
            $.ajax({
                url: '/customer/get-code.html',
                data: {
                    mobile: mobile,
                    yzm: yzm
                }
            }).done(function (res) {
                if (res.error === 102) {
                    $.alert(res.msg, {
                        confirmFn: function () {
                            window.location.reload();
                        }
                    });
                    return;
                }
                if (res.error === 0) {
                    self.timeDown();
                } else {
                    self.getCaptcha();
                    $.alert(res.msg);
                }
            }).fail(function () {
                $.toast('请求失败,请重试');
            }).always(function () {
                self.isCodeGetting = false;
            });
        },
        timeDown: function () {
            var self = this;
            var timeout = 120;
            self.time = timeout;
            var t = setInterval(function () {
                if (timeout-- === 0) {
                    clearInterval(t);
                } else {
                    self.time = timeout;
                }
            }, 1000);
        },
        checkMobile: function (mobile) {
            if (mobile.length === 0) {
                $.toast('手机号不能为空');
                return false;
            }
            if (!utils.checkMobile(mobile)) {
                $.toast('手机号码格式不正确');
                return false;
            }
            return true;
        },
        checkCode: function (code) {
            if (code.length === 0) {
                $.toast('验证码不能为空');
                return false;
            }
            return true;
        },
        submitLogin: function () {
            var self = this,
                mobile = self.mobile,
                code = self.code;
            if (!self.checkMobile(mobile)) {
                return;
            }
            if (!self.checkCode(code)) {
                return;
            }
            self.isFetching = true;
            self.beforeLogin && self.beforeLogin();
            $.ajax({
                method: 'post',
                url: '/customer/check-login.html',
                data: {
                    userName: mobile,
                    yzmLogin: 1,
                    mobile: mobile,
                    code: code,
                    customerSource: self.customerSource
                }
            }).done(function (res) {
                if (res.error === 0) {
                    self.loginSuccess(res.data);
                } else if (res.error === 11 || res.error === 12) {
                    //error为11时，手机号已绑定多个账号，选择一个账号登录，未选择的账号，清空mobile、isCheck字段信息（等于将此手机号与其他账号解绑并清空mobile）调用unbindMobile
                    //error为12时，手机号未与账号绑定，并且手机号不等于custID，如果有账号的mobile为此手机号，则绑定手机号并登录,如果有多个账号的mobile=手机号，则选择一个绑定并登录
                    self.bind = res.error === 12 ? 'bind' : '';
                    self.mobileList = res.data;
                    self.selectedMobile = res.data[0].mobile;
                    self.custID = res.data[0].custID;
                    self.showConfirm = true;
                } else {
                    $.alert(res.msg);
                }
            }).always(function () {
                self.isFetching = false;
                self.loginComplete && self.loginComplete();
            });
        },
        unbindMobile: function () {
            var self = this;
            var bind = self.bind || 'unbind';
            if (self.isUnbinding) {
                return;
            }
            self.isUnbinding = true;
            $.ajax({
                method: 'get',
                url: '/customer/' + bind + '.html',
                data: {custID: self.custID, mobile: self.selectedMobile}
            }).done(function (res) {
                if (res.error === 0) {
                    self.loginSuccess(res.data);
                } else {
                    $.alert(res.msg);
                }
            }).always(function () {
                self.isUnbinding = false;
            });
        },
        loginSuccess: function (data) {
            this.showConfirm = false;
            this.successFn && this.successFn(data);
            this.$emit('loginSuccess');
        }
    }
});