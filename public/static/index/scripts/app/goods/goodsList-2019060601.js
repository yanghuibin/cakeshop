var carouselSwiper = null;
var filterSwiper = null;

$(function () {
    //显示筛选
    $('#filterBtn').click(function () {
        $('#filterWrap').addClass('active');
    });
    //隐藏筛选
    $('#filterWrap .cover').click(function () {
        $('#filterWrap').removeClass('active');
    });
    //切换选中
    $('#filterWrap dd').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
    });
    //取消选中
    $('#resetBtn').click(function () {
        window.location = utils.createUrl({series: [], taste: []});
    });
    //提交筛选结果
    $('#submitBtn').click(function () {
        var series = [],
            taste = [],
            params = {};
        $('#filterWrap .series dd.active').each(function () {
            series.push($(this).attr('data-id'));
        });
        $('#filterWrap .taste dd.active').each(function () {
            taste.push($(this).attr('data-id'));
        });
        if (series.length) {
            params.series = series.join(',');
        }
        if (taste.length) {
            params.taste = taste.join(',');
        }
        window.location = utils.createUrl(params);
    });
    //排序
    $('[data-sort]').click(function () {
        var me = $(this);
        if (me.hasClass('active')) {
            return;
        }
        window.location = utils.createUrl({sort: me.attr('data-sort')});
    });
    //站点选择器
    citySelector.init();
    //滚动顶部
    BackTop.init();

    if ($('.main_goods_list').hasClass('markup')) {
        $('html,body').scrollTop(0);
        $('.main .swiper-slide').eq(0).addClass('loaded');
        $('.main_goods_list.markup .header_wrap .item_type').click(function () {
            $(this).addClass('active').parent().siblings().find('.item_type').removeClass('active');
            var idx = parseInt($(this).attr('data-idx'));
            if (idx === 1) {
                filterSwiper.slideTo(0, 1000, true);
            }
            if (idx === 5) {
                filterSwiper.slideTo(4, 1000, true);
            }
            carouselSwiper.slideTo(idx, 1000, true);
            $('html,body').scrollTop(0);
        });
        carouselSwiper = new Swiper('#markupFilterListSwiper', {
            effect: 'slide',
            autoHeight: true, //高度随内容变化
            loop: false,
            onTransitionStart: function (swiper) {
                loadImgBySlide($('.main .swiper-slide').eq(swiper.activeIndex));
            },
            onTransitionEnd: function (swiper) {
                $("img.lazy").lazyload();
                var idx = swiper.activeIndex;
                $('.main_goods_list.markup .header_wrap .item_type').eq(idx).click();
            }
        });
        filterSwiper = new Swiper('#markupFilterSwiper', {
            loop: false,
            slidesPerView: 5.5
        });
    }
});

function loadImgBySlide(container) {
    if (!container.hasClass('loaded')) {
        container.find("img.lazy").lazyload({
            threshold: 200,
            effect: 'fadeIn'
        });
        container.addClass('loaded');
    }
}