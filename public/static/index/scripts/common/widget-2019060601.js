var loading = {
    show: function () {
        if ($('#globalLoading').length) {
            return;
        }
        $('<div id="globalLoading" class="global_loading">' +
            '<div class="inner"></div><div class="inner"></div></div>').appendTo('body')[0].addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);
    },
    hide: function () {
        $('#globalLoading').remove();
    }
};

var mask = {
    show: function (options) {
        var self = this;
        var defaults = {
            className: '',
            container: $('body'),
            aniTime: 500,
            initFn: null,
            closeFn: null
        };
        var opts = $.extend({}, defaults, options);
        if ($('.global_cover').length) {
            return;
        }
        $('<div class="global_cover no_touch ' + opts.className + '"></div>').appendTo(opts.container);
        opts.initFn && opts.initFn();
        if (opts.aniTime) {
            $('.global_cover').css({
                transitionDuration: opts.aniTime + 'ms'
            });
        }
        setTimeout(function () {
            $('.global_cover').addClass('active').click(function () {
                if (opts.closeFn) {
                    opts.closeFn();
                } else {
                    self.hide(opts.aniTime);
                }
            });
        }, 17);
    },
    hide: function (aniTime) {
        if (utils.isType(aniTime, 'undefined')) {
            aniTime = 500;
        }
        $('.global_cover').removeClass('active');
        setTimeout(function () {
            $('.global_cover').remove();
        }, aniTime);
    }
};

(function ($) {
    var Dialog = function (options) {
            this.options = options;
            this.uuid = utils.uuid();
        },
        DialogArr = [];
    var toast = {
        timers: [],
        duration: 0,
        node: null,
        countdown: function () {
            var that = this;
            var t = setTimeout(function () {
                that.close();
            }, this.duration);
            this.timers.push(t);
        },
        close: function () {
            var that = this;
            this.node.classList.remove('active');
            var t = setTimeout(function () {
                if (that.node) {
                    document.body.removeChild(that.node);
                }
                that.onClose && that.onClose();
                that.node = null;
            }, 500);
            this.timers.push(t);
        },
        show: function (content, duration, onClose, more) {
            more = more || {};
            duration = duration || 1500;
            var that = this;
            this.timers.forEach(function (timer) {
                window.clearTimeout(timer);
            });
            this.timers = [];
            this.duration = duration + 700;
            this.onClose = onClose;
            if (this.node) {
                this.node.innerHTML = content;
            } else {
                var div = document.createElement('div');
                div.className = 'global_toast ' + more.className;
                div.innerHTML = content;
                document.body.appendChild(div);
                this.node = div;
            }
            setTimeout(function () {
                that.node.classList.add('active');
                that.countdown();
            }, 0);
        }
    };
    Dialog.prototype = {
        show: function () {
            var self = this;
            var defaults = {
                wrap: null,
                className: '',
                container: $('body'),
                title: '提示',
                content: '',
                confirmText: '确定',
                cancelText: '取消',
                wrapCss: {},
                coverCss: {},
                innerCss: {},
                closeCss: {},
                headerCss: {},
                h3Css: {},
                footerCss: {},
                linkCss: {},
                showClose: false,
                initFn: function () {

                },
                cancelFn: function () {
                    self.hide();
                },
                confirmFn: function () {
                    self.hide();
                },
                closeFn: function () {
                    self.hide();
                }
            };
            var opts = $.extend({}, defaults, self.options);
            var html = '<article class="global_modal no_touch"><div class="cover"></div><div class="inner ' + opts.className + '">';
            if (opts.showClose) {
                html += '<a href="javascript:void(0);" class="close_btn">关闭</a>';
            }
            if (!opts.hideHeader) {
                html += '<header><h3>' + opts.title + '</h3></header>';
            }
            html += '<div class="content">' + opts.content + '</div>';
            html += '<footer>';
            if (opts.showConfirm && opts.showCancel) {
                html += '<div class="btn_wrap both">' +
                    '<a class="btn cancel_btn" href="javascript:void(0)">' + opts.cancelText + '</a>' +
                    '<a class="btn confirm_btn" href="javascript:void(0)">' + opts.confirmText + '</a>' +
                    '</div>';
            } else {
                html += '<div class="btn_wrap single">' +
                    '<a class="btn confirm_btn">' + opts.confirmText + '</a>' +
                    '</div>';
            }
            html += '</footer></div></article>';
            self.wrap = $(html).appendTo(opts.container);
            if (utils.isType(opts.content, 'object')) {
                self.wrap.find('.content').html(opts.content);
            }
            opts.initFn();
            self.wrap.css(opts.wrapCss).find('.cover').css(opts.coverCss)
                .end().find('.inner').css(opts.coverCss)
                .end().find('admin.common.header').css(opts.headerCss)
                .end().find('header h3').css(opts.h3Css)
                .end().find('footer').css(opts.footerCss)
                .end().find('footer a').css(opts.linkCss);
            self.wrap.find('.confirm_btn').click(function () {
                opts.confirmFn();
            }).end().find('.cancel_btn').click(function () {
                opts.cancelFn();
            }).end().find('.close_btn').click(function () {
                self.hide();
                opts.closeFn && opts.closeFn();
            });
            self.wrap.fadeIn(100);
            DialogArr.push({
                key: self.uuid,
                o: self
            });
            return self;
        },
        hide: function () {
            var self = this,
                wrap = this.wrap;
            wrap.fadeOut(100, function () {
                wrap.remove();
                DialogArr = DialogArr.filter(function (item) {
                    return item.key !== self.uuid;
                });
            });
        }
    };
    $.extend({
        alert: function (content, more) {
            var dialog = new Dialog($.extend({}, {
                content: content,
                className: 'alert',
                confirmFn: function () {
                    dialog.hide();
                }
            }, more));
            return dialog.show();
        },
        confirm: function (content, confirmFn, more) {
            var dialog = new Dialog($.extend({}, {
                content: content,
                className: 'confirm',
                hideHeader: true,
                showConfirm: true,
                showCancel: true,
                confirmFn: confirmFn || function () {
                    dialog.hide();
                }
            }, more));
            return dialog.show();
        },
        removeDialog: function (uuid) {
            if (uuid) {
                DialogArr.forEach(function (item) {
                    if (item.key === uuid) {
                        item.o.hide();
                    }
                });
            } else {
                DialogArr.forEach(function (item) {
                    item.o.hide();
                });
            }
        },
        getDialogArr: function () {
            return DialogArr;
        },
        toast: function (content, duration, onClose, more) {
            toast.show(content, duration, onClose, more);
        }
    });
})(jQuery);

(function ($) {
    function SelectItem(data, options) {
        data = data || [];
        if (!data.length) {
            return;
        }
        this.data = data;
        var defaults = {
            wrap: null,
            selectedItem: {},
            lineWidth: '70%',
            liHeight: 40,
            count: 7,
            currentItem: null,
            value: '',          //默认值
            //初始化后执行
            initFn: function () {
            },
            //选中新项时执行
            pickedFn: function () {
            }
        };
        var opts = $.extend(defaults, options),
            liHeight = opts.liHeight;
        var w = $(window).width();
        if (w < 375) {
            liHeight = parseInt(liHeight * .95);
        } else if (w > 375) {
            liHeight = parseInt(liHeight * 1.07);
        }
        this.opts = $.extend(opts, {liHeight: liHeight});
        this.finger = {startY: 0, lastY: 0, startTime: 0, lastTime: 0, transformY: 0};
    }

    SelectItem.prototype = {
        init: function () {
            this.createItem();
            this.initStyle();
            this.bindEvent();
            this.scrollTo(this.opts.value);
        },
        scrollTo: function (val, time) {
            time = time || 0;
            var self = this, index = -1, move = 0;
            this.data.forEach(function (item, idx) {
                if (item.val === val) {
                    index = idx;
                }
            });
            if (index !== -1) {
                move = index * this.opts.liHeight;
            }
            this.setListTransform(-move, 'end', time);
            setTimeout(function () {
                self.setCurrent();
            }, 200);
        },
        createItem: function () {
            var opts = this.opts;
            this.wrap = $('<div class="select_item">' +
                '<div class="select_line" style="width: ' + opts.lineWidth + ';left:15%"></div>' +
                '<div class="select_list">' +
                '<ul></ul>' +
                '</div>' +
                '<div class="select_list list_cover">' +
                '<ul></ul>' +
                '</div>' +
                '</div>');
            this.createContent();
        },
        createContent: function () {
            var li = '';
            this.data.forEach(function (item, index) {
                li += '<li class="list_item no_wrap" data-index="' + index + '" data-val="' + item.val + '">' + item.label + '</li>';
            });
            this.wrap.find('ul').html(li);
        },
        initStyle: function () {
            var opts = this.opts,
                liHeight = opts.liHeight,
                count = opts.count;
            this.wrap.css({height: liHeight * count})
                .find('.select_line,.select_list').css({
                top: Math.round((count - 1) * liHeight / 2) + 'px',
                height: liHeight + 'px'
            }).end().find('li').css({height: liHeight + 'px', lineHeight: liHeight + 'px'});
        },
        bindEvent: function () {
            var self = this,
                dom = this.wrap[0];
            dom.addEventListener('touchstart', self.touchStart.bind(self));
            dom.addEventListener('touchmove', self.touchMove.bind(self));
            dom.addEventListener('touchend', self.touchEnd.bind(self));
            dom.addEventListener('touchcancel', self.touchEnd.bind(self));
        },
        touchStart: function (event) {
            var finger = event.changedTouches[0];
            this.finger.startY = finger.pageY;
            this.finger.startTime = event.timestamp || Date.now();
            this.finger.transformY = this.wrap.find('ul').attr('scroll') || 0;
            event.preventDefault();
        },
        touchMove: function (event) {
            var finger = event.changedTouches[0];
            this.finger.lastY = finger.pageY;
            this.finger.lastTime = event.timestamp || Date.now();
            var move = this.finger.lastY - this.finger.startY;
            this.setStyle(move);
            event.preventDefault();
        },
        touchEnd: function (event) {
            var finger = event.changedTouches[0];
            this.finger.lastY = finger.pageY;
            this.finger.lastTime = event.timestamp || Date.now();
            var move = this.finger.lastY - this.finger.startY;
            var time = this.finger.lastTime - this.finger.startTime;
            var v = move / time;
            var a = 1.8;
            if (time <= 300) {
                move = v * a * time;
                time = 500 + time * a;
                this.setStyle(move, 'end', time);
            } else {
                this.setStyle(move, 'end');
            }
        },
        setStyle: function (move, type, time) {
            var currentListMove = this.finger.transformY,
                updateMove = move + Number(currentListMove),
                liHeight = this.opts.liHeight;
            if (updateMove > 0) {
                updateMove = 0;
            }
            if (updateMove < -(this.data.length - 1) * liHeight) {
                updateMove = -(this.data.length - 1) * liHeight;
            }
            if (type === 'end') {
                updateMove = Math.round(updateMove / liHeight) * liHeight;
                this.setListTransform(updateMove, type, time);
                var self = this;
                setTimeout(function () {
                    self.setCurrent();
                }, 200);
            } else {
                this.setListTransform(updateMove);
            }
        },
        setListTransform: function (translateY, type, time) {
            translateY = translateY || 0;
            time = time || 800;
            var ul = this.wrap.find('ul');
            var cssObj = {
                webkitTransition: '',
                webkitTransform: 'translateY(' + translateY + 'px)'
            };
            if (type === 'end') {
                cssObj.webkitTransition = 'transform ' + time + 'ms cubic-bezier(0.19, 1, 0.32, 1)';
            }
            ul.css(cssObj).attr('scroll', translateY);
        },
        setCurrent: function () {
            var index = Math.abs(this.wrap.find('ul').attr('scroll') / this.opts.liHeight || 0);
            this.currentItem = this.data.filter(function (item, idx) {
                return idx === index;
            })[0];
            this.opts.pickedFn && this.opts.pickedFn(this.currentItem);
        }
    };

    function IOSSelect(data, options) {
        data = data || [];
        if (!data.length) {
            return;
        }
        var self = this;
        this.data = data;
        var defaults = {
            wrap: null,
            className: '',
            container: $('body'),
            title: '选择列表项',
            confirmText: '确定',
            cancelText: '取消',
            hideTime: 300,
            //初始化后执行
            initFn: function () {
            },
            //点击取消
            cancelFn: function () {
                self.hide();
            },
            //点击确定
            confirmFn: function () {
                self.hide();
            },
            //点击关闭
            closeFn: function () {
                self.hide();
            }
        };
        this.items = {};
        this.opts = $.extend(defaults, options);
    }

    IOSSelect.prototype = {
        //创建容器
        createWrap: function () {
            var opts = this.opts;
            this.wrap = $('<article class="ios_select ' + opts.className + '">' +
                '<div class="wrap">' +
                '<header>' +
                '<h2>' + opts.title + '</h2>' +
                '<a href="javascript:void(0)" class="cancel_btn">' + opts.cancelText + '</a>' +
                '<a href="javascript:void(0)" class="confirm_btn">' + opts.confirmText + '</a>' +
                '</header>' +
                '<div class="content ' + (this.data.length === 2 ? 'double' : '') + '">' +
                '</div>' +
                '</div>' +
                '<div class="cover"></div>' +
                '</article>').appendTo(opts.container);
            this.cancelBtn = this.wrap.find('.cancel_btn');
            this.confirmBtn = this.wrap.find('.confirm_btn');
            this.content = this.wrap.find('.content');
            this.createContent();
            this.bindEvent();
            opts.initFn();
        },
        //创建主体内容
        createContent: function () {
            var self = this;
            self.content.html('');
            self.data.forEach(function (item) {
                var selectItem = new SelectItem(item.data, $.extend({}, item.options));
                selectItem.init();
                self.content.append(selectItem.wrap);
                self.items[item.key] = selectItem;
                selectItem.opts.initFn && selectItem.opts.initFn(selectItem);
            });
        },
        bindEvent: function () {
            var self = this,
                opts = self.opts;
            this.cancelBtn.click(function () {
                opts.cancelFn && opts.cancelFn();
            });
            this.confirmBtn.click(function () {
                opts.confirmFn && opts.confirmFn();
            });
        },
        //更新
        update: function (data) {
            data = data || [];
            this.data = data;
            this.items = [];
            this.createContent();
        },
        //创建
        show: function () {
            var self = this;
            self.createWrap();
            setTimeout(function () {
                self.wrap.addClass('active');
            }, 0);
        },
        //销毁
        hide: function () {
            var self = this;
            this.wrap.removeClass('active');
            setTimeout(function () {
                self.wrap.remove();
            }, self.opts.hideTime);
        }
    };
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = IOSSelect;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return IOSSelect;
        });
    } else {
        window.IOSSelect = IOSSelect;
    }
})(jQuery);

var BackTop = {
    dom: null,
    create: function () {
        this.dom = $('<a href="javascript:void(0)" class="global_back_top hide" id="backTop"></a>').appendTo($('.container'));
    },
    bindEvent: function () {
        // 滚屏
        var dom = this.dom,
            winHeight = $(window).height();
        $(window).scroll(function () {
            var top = $(this).scrollTop();
            if (top > winHeight / 2) {
                dom.removeClass('hide');
            } else {
                dom.addClass('hide');
            }
        });
        //返回顶部
        dom.click(function () {
            $('html,body').animate({scrollTop: 0});
        });
    },
    init: function () {
        this.create();
        this.bindEvent();
    }
};

//css过渡
function fnTransition(dom, time, delay) {
    delay = delay || 0;
    dom.css({
        '-webkit-transition': 'all ' + time + 's ' + delay + 's',
        'transition': 'all ' + time + 's ' + delay + 's'
    });
}

//css位移
function fnTranslate(dom, x, y) {
    dom.css({
        '-webkit-transform': 'translate3d(' + x + 'px,' + y + 'px,0)',
        'transform': 'translate3d(' + x + 'px,' + y + 'px,0)'
    });
}

var citySelector = {
    opts: {},
    wrap: null,
    forceShow: false,       //强制显示弹窗
    cityArr: globalSiteList,
    cityId: 2,
    createList: function () {
        var cityId = this.cityId,
            opts = this.opts,
            cityName = '',
            html = '<article class="city_selector hide no_touch" id="citySelector">' +
                '<header>' +
                '<h2>配送至</h2>' +
                '<h3>当前定位城市：<strong>' + globalCurrentCity + '</strong></h3>' +
                '</header>' +
                '<div class="main">' +
                '<h4>更多城市：</h4>' +
                '<div class="city_list clear_fix">';
        $.each(this.cityArr, function (i, v) {
            var className = '';
            if (v.id === cityId) {
                cityName = v.title;
                className = 'active';
            }
            if ($.inArray(v.id, opts.disabledArr) !== -1) {
                className = 'disabled';
            }
            html += '<a href="javascript:void(0)"' +
                'data-id="' + v.id + '" ' +
                'data-alias="' + v.alias + '"' +
                ' class="' + className + '">' + v.title + '</a>';
        });
        html += '</div>' +
            '</div>' +
            '</article>';
        $(html).appendTo($('body'));
        $(this.opts.cityName).text(cityName);
        this.wrap = $('#citySelector');
        this.bindHandler();
        if (this.forceShow) {
            this.show();
        }
    },
    bindHandler: function () {
        var self = this,
            wrap = self.wrap;
        //切换城市
        wrap.find('.city_list a').click(function () {
            var me = $(this),
                alias = me.attr('data-alias');
            if (me.hasClass('disabled')) {
                return;
            }
            if (me.hasClass('active')) {
                self.hide();
                return false;
            }
            self.link(alias);
        });
        $(self.opts.dom).click(function () {
            self.show();
        });
    },
    link: function (alias) {
        var search = location.search.split('?')[1],
            params = [],
            newSearch = '',
            newSearchArr = [],
            siteStr = '_site=' + alias;
        if (search) {
            search.split('&').forEach(function (item) {
                params = item.split('=');
                if (params[0] === '_site') {
                    item = '_site=' + alias;
                }
                newSearchArr.push(item);
            });
            if ($.inArray(siteStr, newSearchArr) === -1) {
                newSearchArr.push(siteStr);
            }
            newSearch = newSearchArr.join('&');
        } else {
            newSearch = siteStr;
        }
        loading.show();
        window.location.href = location.origin + location.pathname + '?' + newSearch;
        loading.hide();
    },
    hide: function () {
        this.wrap.addClass('hide');
        mask.hide(0);
    },
    show: function () {
        mask.show({
            aniTime: 0, closeFn: function () {
                if (citySelector.forceShow) {
                    return false;
                }
                citySelector.hide();
            }
        });
        this.wrap.removeClass('hide');
    },
    init: function (options) {
        this.opts = $.extend({
            dom: '#selectCity',
            cityName: '#currentCity',
            disabledArr: []
        }, options);
        var cityCode = cookie.get('CITY_ID');
        this.cityId = parseInt(cityCode.split('_')[1]);
        this.forceShow = $.inArray(this.cityId, this.opts.disabledArr) > -1;
        this.createList();
    }
};

var miniProgramNav = {
    create: function () {
        this.dom = $('<div class="miniProgramNavWrap no_touch" id="miniProgramNavWrap">' +
            '<div class="cover"></div>' +
            '            <a href="javascript:void(0)" class="toggleMiniProgramNav" id="toggleMiniProgramNav"></a>' +
            '                <nav class="miniProgramNavList" id="miniProgramNavList">' +
            '                    <a href="/h5">首页</a>' +
            '                    <a href="/h5/list">蛋糕</a>' +
            '                    <a href="/h5/list?uid=1000">小食</a>' +
            '                    <a href="/h5/cart">购物车</a>' +
            '                    <a href="/h5/customer/index">个人中心</a>' +
            '                </nav>' +
            '        </div>').appendTo($('body'));
    },
    bindEvent: function () {
        $('#toggleMiniProgramNav').click(function () {
            $('#miniProgramNavList').toggleClass('active');
            $('#miniProgramNavWrap .cover').fadeToggle(500);
        });
    },
    init: function () {
        this.create();
        this.bindEvent();
    }
};