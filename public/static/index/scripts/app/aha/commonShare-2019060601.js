$(function () {

    /** aha商城除商品详情页以外其他页面公用微信分享 **/

    var option = {
        title: '今天为你精选了这些aha会员福利哦～',
        desc: '越看越惊喜，快进来挑选吧！',
        link: '',
        imgUrl: 'https:'+staticUrl + 'images/aha/share.jpg?20190325'
    };
    globalWechat.share(option);

});