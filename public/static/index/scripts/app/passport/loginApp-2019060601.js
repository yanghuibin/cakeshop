var loginApp = new Vue({
    el: '#loginApp',
    data: {
        currentForm: 'login',
        isShowBind: false,                       //第三方授权后显示bind弹窗

        isUnbinding: false,         //是否正在解绑
        showConfirm: false,         //是否显示confirm
        currentMobile: '',           //当前登录手机号
        selectedMobile: '',         //选择要绑定的手机号
        custID: '',                 //解绑使用的用户uid
        bindFlag: '',                   //调用bind或unbind的标识
        mobileList: [],              //多账号的手机列表

        login: {
            loginType: 'mobile',               //登录方式 username 账号登录   mobile 手机登录

            mobile: '',
            code: '',
            mobileError: '',
            codeError: '',

            isYzm: isYzm,                           //0传随机码，1传图片验证码

            username: '',               //账号,
            password: '',               //密码
            usernameError: '',
            passwordError: '',
            isNeedCheckYzm: loginErrorCount >= 3,            //账号密码登录，失败3次后开始显示图片验证码

            yzm: '',                             //图像验证码
            yzmError: '',                        //验证码错误
            captchaImg: GlobalConfig.staticUrl + '/images/grey.gif',                     //图形验证码图片

            time: 0,
            isCodeGetting: false,

            userNameForBind: '',               //账户登录未绑定手机时的账户名，用作手机绑定的username值,
            yzmLogin: 1,                //1是手机验证登录，2是绑定手机

            isFetching: false           //是否正在登录
        },
        bind: {
            loginType: 'mobile',               //登录方式 username 账号登录   mobile 手机登录

            mobile: '',
            code: '',
            mobileError: '',
            codeError: '',

            isNeedCheckYzm: true,            //第三方绑定时始终需要图形验证码

            yzm: '',                             //图像验证码
            yzmError: '',                        //验证码错误
            captchaImg: GlobalConfig.staticUrl + '/images/grey.gif',                     //图形验证码图片

            time: 0,
            isCodeGetting: false,

            yzmLogin: 1,                //1是手机验证登录，2是绑定手机

            isFetching: false           //是否正在登录
        }
    },
    created: function () {
        this.isShowBind = isBind > 0;
        if (this.login.isYzm === 1) {
            this.login.yzm = '';
        }
    },
    mounted: function () {
        var self = this;
        if (!this.isNeedDefaultYzm) {
            this.getCaptcha();
        }
        //回车提交
        document.onkeydown = function (event) {
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if (e && e.keyCode === 13) {
                self.submitLogin();
            }
        };
    },
    methods: {
        //获取图形验证码
        getCaptcha: function () {
            var self = this,
                currentApp = self.currentApp;
            var url = '/customer/captcha.html?w=80&h=30&offset=2';
            $.get(url + '&refresh=true', function () {
                currentApp.captchaImg = url + '&v=' + Math.random();
            });
        },
        //获取短信验证码
        sendSMS: function () {
            var self = this,
                currentApp = this.currentApp,
                data = {},
                mobile = currentApp.mobile,
                yzm = currentApp.yzm,

                csessionid = $('#csessionid').val(),
                sig = $('#sig').val(),
                token = $('#token').val(),

                isAliVerify = currentApp.isAliVerify && !self.isShowBind && self.currentForm === 'register';

            if (!self.checkMobile(mobile)) {
                return;
            }
            data.mobile = mobile;

            if (self.isNeedDefaultYzm) {
                yzm = defaultYzm.split('').reverse().join('');
            }

            if (isAliVerify) {
                if (!csessionid) {
                    currentApp.aliVerifyError = '请拖动滑块完成验证';
                    return;
                }
                data.csessionid = csessionid;
                data.sig = sig;
                data.token = token;
            } else {
                if (!yzm) {
                    currentApp.yzmError = '验证码不能为空';
                    return;
                }
                data.yzm = yzm;
            }

            currentApp.isCodeGetting = true;

            var failFn = function () {
                if (isAliVerify) {
                    self.resetAliVerify();
                }
                currentApp.yzm = '';
                if (!self.isNeedDefaultYzm) {
                    self.getCaptcha();
                }
            };

            $.ajax({
                method: 'get',
                url: '/customer/get-code.html',
                data: data
            }).done(function (data) {
                var error = data.error;
                if (error === 0) {
                    self.timeDown();
                } else if (error === 101) {
                    //此时阿里验证次数已用完，需要切换到图形验证码
                    self.aliVerify = null;
                    currentApp.isAliVerify = false;
                } else if (error === 102) {
                    $.alert(data.msg, {
                        confirmFn: function () {
                            window.location.reload();
                        }
                    })
                } else {
                    $.alert(data.msg);
                    failFn();
                }
            }).fail(function () {
                failFn();
            }).always(function () {
                currentApp.isCodeGetting = false;
            });
        },
        //生成滑动验证码
        createAliVerify: function () {
            var currentApp = this.currentApp;
            var nc = new noCaptcha();
            var nc_appkey = 'FFFF000000000173456C';  //应用标识,不可更改
            var nc_scene = 'register';  //场景,不可更改
            var nc_token = [nc_appkey, (new Date()).getTime(), Math.random()].join(':');
            var nc_option = {
                renderTo: '#aliVerifyDom',//渲染到该DOM ID指定的Div位置
                appkey: nc_appkey,
                scene: nc_scene,
                token: nc_token,
                trans: '{"name1":"code100"}',//测试用，特殊nc_appkey时才生效，正式上线时请务必要删除；code0:通过;code100:点击验证码;code200:图形验证码;code300:恶意请求拦截处理
                callback: function (data) {//校验成功回调
                    $('#csessionid').val(data.csessionid);
                    $('#sig').val(data.sig);
                    $('#token').val(data.token);
                    $('#scene').val(data.scene);
                    currentApp.aliVerifyError = '';
                }
            };
            nc.init(nc_option);
            this.aliVerify = nc;
        },
        // 重置滑动验证码
        resetAliVerify: function () {
            var aliVerify = this.aliVerify;
            if (!aliVerify) {
                return;
            }
            aliVerify.reset();
            $('#csessionid').val('');
            $('#sig').val('');
            $('#token').val('');
        },
        //短信验证码倒计时
        timeDown: function () {
            var self = this,
                currentApp = self.currentApp;
            var timeout = 120;
            currentApp.time = timeout;
            var t = setInterval(function () {
                if (timeout-- === 0) {
                    clearInterval(t);
                } else {
                    currentApp.time = timeout;
                }
            }, 1000);
            currentApp.timer = t;
        },
        //检查手机号
        checkMobile: function (mobile) {
            var currentApp = this.currentApp;
            if (mobile.length === 0) {
                currentApp.mobileError = '手机号码不能为空';
                return false;
            }
            if (!utils.checkMobile(mobile)) {
                currentApp.mobileError = '手机号码格式不正确';
                return false;
            }
            return true;
        },
        //检查短信验证码
        checkCode: function (code) {
            var currentApp = this.currentApp;
            if (code.length === 0) {
                currentApp.codeError = '请输入短信验证码';
                return false;
            }
            return true;
        },
        //提交登录 登录、注册、绑定手机都调用此方法
        submitLogin: function () {
            var self = this,
                currentApp = self.currentApp,
                data = {},
                isLoginByMobile = currentApp.loginType !== 'username',
                isAliVerify = currentApp.isAliVerify && !self.isShowBind && self.currentForm === 'register',

                mobile = currentApp.mobile,
                code = currentApp.code,

                username = currentApp.username,
                password = currentApp.password,

                yzm = currentApp.yzm,

                yzmLogin = currentApp.yzmLogin || 1;

            if (self.currentForm === 'register' && !currentApp.isCheckedRule) {
                return;
            }

            if (isLoginByMobile) {
                if (!self.checkMobile(mobile)) {
                    return;
                }
                if (!self.checkCode(code)) {
                    return;
                }
                data = {
                    userName: yzmLogin === 1 ? mobile : currentApp.userNameForBind,
                    yzmLogin: yzmLogin,
                    mobile: mobile,
                    code: code
                }
            } else {
                if (!username) {
                    currentApp.usernameError = '用户名不能为空';
                    return;
                }
                if (!(utils.checkEmail(username) || utils.checkMobile(username))) {
                    currentApp.usernameError = '用户名格式不正确';
                    return;
                }
                if (!password) {
                    currentApp.passwordError = '密码不能为空';
                    return;
                }
                data = {
                    userName: username,
                    passWord: password
                };
                if (currentApp.isNeedCheckYzm) {
                    if (!yzm) {
                        currentApp.yzmError = '验证码不能为空';
                        return;
                    }
                    data.yzm = yzm;
                }
            }

            self.isFetching = true;

            $.ajax({
                method: 'post',
                url: '/customer/check-login.html',
                data: data
            }).done(function (res) {
                var error = res.error,
                    data = res.data;
                if (res.errorCount >= 3) {
                    currentApp.isNeedCheckYzm = true;
                }
                if (error === 0) {
                    self.loginSuccess(data);
                } else if (error === 10) {
                    //没有绑定手机号，跳转绑定手机
                    self.toggleBindMobile(username);
                } else if (error === 11 || error === 12) {
                    self.currentMobile = currentApp.mobile || currentApp.username;
                    //error为11时，手机号已绑定多个账号，选择一个账号登录，未选择的账号，清空mobile、isCheck字段信息（等于将此手机号与其他账号解绑并清空mobile）调用unbindMobile
                    //error为12时，手机号未与账号绑定，并且手机号不等于custID，如果有账号的mobile为此手机号，则绑定手机号并登录,如果有多个账号的mobile=手机号，则选择一个绑定并登录
                    self.bindFlag = error === 12 ? 'bind' : '';

                    self.mobileList = data;
                    self.selectedMobile = data[0].mobile;
                    self.custID = data[0].custID;
                    self.showConfirm = true;
                } else {
                    $.alert(res.msg);
                }
            }).always(function () {
                currentApp.isFetching = false;
                if (isAliVerify) {
                    self.resetAliVerify();
                } else {
                    //更新验证码
                    self.getCaptcha();
                    currentApp.yzm = '';
                }
            });
        },
        //解绑手机
        unbindMobile: function () {
            var self = this;
            var bind = self.bindFlag || 'unbind';
            if (self.isUnbinding) {
                return;
            }
            self.isUnbinding = true;
            $.ajax({
                method: 'get',
                url: '/customer/' + bind + '.html',
                data: {custID: self.custID, mobile: self.selectedMobile}
            })
                .done(function (res) {
                    if (res.error === 0) {
                        self.loginSuccess(res);
                    } else {
                        $.alert(res.msg);
                    }
                })
                .always(function () {
                    self.isUnbinding = false;
                });
        },
        //登录成功回调
        loginSuccess: function (res) {
            this.showConfirm = false;
            if (res.isNew === 1) {
                //新用户提示后登录
                window.location = lastUrl;
            } else {
                window.location = lastUrl;
            }
            this.successFn && this.successFn();
        },
        //微信登录
        loginByWx: function (href) {
            var width = 560,
                height = 540,
                left = ($(window).width() - width) / 2,
                top = ($(window).height() - height) / 2;
            window.open(href, '_blank', 'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=' + width + ', height=' + height + ',left=' + left + ',top=' + top);
        },
        //跳转绑定手机号
        toggleBindMobile: function (username) {
            var currentApp = this.currentApp;
            currentApp.loginType = 'mobile';
            this.$nextTick(function () {
                clearInterval(currentApp.timer);
                currentApp.yzmLogin = 2;
                currentApp.userNameForBind = username;
                currentApp.mobile = '';
                currentApp.isYzm = 1;
                currentApp.yzm = '';
                currentApp.code = '';
                currentApp.time = 0;
            });
        }
    },
    computed: {
        //当前表单对象
        currentApp: function () {
            var key = this.currentForm;
            if (this.isShowBind) {
                key = 'bind';
            }
            return this[key];
        },
        //是否需要默认验证码
        isNeedDefaultYzm: function () {
            var currentApp = this.currentApp;
            return this.currentForm === 'login' && currentApp.yzmLogin === 1 && currentApp.isYzm === 0;
        }
    },
    watch: {
        currentForm: function (val) {
            var self = this;
            if (val === 'register' && this.register.isAliVerify) {
                this.$nextTick(function () {
                    self.createAliVerify();
                });
            } else {
                self.getCaptcha();
            }
        },
        'login.loginType': function () {
            this.getCaptcha();
        },
        isShowBind: function (val) {
            if (!val) {
                this.getCaptcha();
            }
        }
    }
});