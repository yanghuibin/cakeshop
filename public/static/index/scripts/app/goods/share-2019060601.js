var isSpecNew = parseInt($('#isSpecNew').val());

$(function () {
    // 微信分享
    var option = {
        title: goods.goodsName + '—诺心蛋糕网上订购',
        desc: '与你分享每一口甜蜜，愿你品尝生活的温暖与幸福。',
        link: '',
        imgUrl: goods.listMainPic
    };
    globalWechat.share(option);

    // 根据不同浏览器显示分享提示图标和提示文案
    var browser = {
        type: function () {
            var u = navigator.userAgent.toLocaleLowerCase();

            // 微信浏览器
            if (utils.isMobile.Wechat()) {
                if (utils.isMobile.Android()){
                    $('#share .icon_wrap').css('margin-left','6%');
                } else {
                    $('#share .icon_wrap').css('margin-left','11%');
                }
                $('#goodsShareIcon').removeClass('hide');
                return 'wechat';
            }

            // // 搜狗浏览器
            // if (u.indexOf('sougoumobilebrowser') > -1) {
            //     return 'sougou';
            // }

            // // 搜狗搜索
            // if (u.indexOf('sougousearch') > -1) {
            //     return 'sougousearch';
            // }
            //
            // // 2345浏览器
            // if (u.indexOf('mb2345browser') > -1) {
            //     return '2345';
            // }
            //
            // // 百度浏览器
            // if (u.indexOf('baidubrowser') > -1) {
            //     return 'baidu';
            // }
            //
            // // 360浏览器
            // if (u.indexOf('qihoobrowser') > -1) {  // ios采用此方法 android无法判断
            //     return '360';
            // }
            //
            // // 猎豹浏览器
            // if (u.indexOf('liebaofast') > -1) {  // android采用此方法  ios无法判断
            //     return 'liebao';
            // }

            // QQ浏览器  UC浏览器

            if (utils.isMobile.Android()) {
                if (u.indexOf('qqbrowser') > -1 || u.indexOf('ucbrowser') > -1) {
                    $('#goodsShareIcon').removeClass('hide');
                } else {
                    $('#goodsShareIcon').addClass('hide');
                }
                if (u.indexOf('qqbrowser') > -1) {
                    return 'qq'
                }
                if (u.indexOf('ucbrowser') > -1) {
                    return 'uc'
                }
            } else {
                $('#goodsShareIcon').removeClass('hide');
                if (u.indexOf('qqbrowser') > -1) {
                    return 'qq'
                }
                if (u.indexOf('ucbrowser') > -1) {
                    return 'uc'
                }
                return 'safari';
            }

        }
    };

    $('#goodsShareIcon').click(function () {
        $.ajax({
            method: 'get',
            url: '/customer/save-share.html',
            data: {
                params: {
                    postID: goods.postId,
                    channel: 'h5'
                }
            }
        });
        $('#share').show();
    });

    $('#share').click(function () {
        $('#share').hide();
    });

    if (browser.type()) {
        $('#share .icon_wrap').attr('data-browser', browser.type());
        var browserType = $('#share .icon_wrap').attr('data-browser');
        var iconImgUrl = staticUrl + 'images/goods/shareIcons/icon_' + browserType + '.png';
        $('#share .icon_wrap').attr('class', 'icon_wrap data_' + browserType);
        $('#share .icon_wrap img').attr('src', iconImgUrl);
    }
});