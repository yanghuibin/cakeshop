$(function () {
    //商品列表图片懒加载
    $('.lazy').lazyload({
        threshold: 200,
        effect: 'fadeIn'
    });
    //购买
    $(document).on('click', '.buy_btn', function () {
        var me = $(this),
            itemId = me.parents('li').attr('data-id');
        if (me.hasClass('normal') || me.hasClass('disabled')) {
            return;
        }
        app_js.buyItem(itemId, 1);
    });
});