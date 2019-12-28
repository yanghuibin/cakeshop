$(function () {

    /** 查看权益规则 **/

    $('#openRules').click(function () {
        $('.rules_pop').removeClass('hide');
    });
    $('#closeRules').click(function () {
        $('.rules_pop').addClass('hide');
    });

     /**  底部按钮  **/

    // $(window).scroll(function () {
    //     var scrollTop = $(window).scrollTop(),
    //         _h = $(window).height(),
    //         buyTop = 0;
    //     if ($('.interests.not_aha .global_buy_vip_goods').length) {
    //         buyTop = $('.interests.not_aha .global_buy_vip_goods').offset().top;
    //     }
    //     if (scrollTop > buyTop + 50) {
    //         $('#buy').removeClass('hide');
    //     } else {
    //         $('#buy').addClass('hide');
    //     }
    // })

});