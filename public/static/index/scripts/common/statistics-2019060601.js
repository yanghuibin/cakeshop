/**
 * mobile埋点
 * 依赖全局_statLog对象
 * logClick {key,value,是否强制保存用户可能发生跳转到外链或本页多次点击}
 */
function createStatLogData(key, val, isForce) {
    _statLog.logClick('h5_' + key, val, isForce);
}

$(function () {


    //弹窗-去结算
    $(document).on('click', '#dialogPop .confirm_btn', function () {
        if ($('.main_goods_detail').length) {
            createStatLogData('details_Clearing', '弹窗-去结算', true);
        }
    });
    //更多评价+
    $(document).on('click', '#moreComment', function () {
        createStatLogData('details_more', '更多评价+', true);
    });
    //更多评论
    $(document).on('click', '#toggleMoreComment', function () {
        createStatLogData('details_evaluate', '更多', true);
    });
    //弹窗-加入购物车
    $(document).on('click', '#buyPop #addCart', function () {
        if ($('.main_goods_list').length) {
            createStatLogData('list_pop_add_shopcar', '弹窗-加入购物车', true);
        }
    });

    $(document).on('click', '[data-statistics]', function () {
        var me = $(this),
            statisticsFlag = me.attr('data-statistics-flag');
        var data = me.attr('data-statistics').split('|'),
            flag = statisticsFlag ? parseInt(statisticsFlag) > 0 : !!window.statisticsFlag;
        createStatLogData(data[0], data[1], flag);
    });
});
