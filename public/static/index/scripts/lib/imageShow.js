/**
 * Created by luzd on 17/7/12.
 */
(function () {
    function createSwiper(images, index) {
        var li = '';
        $.each(images, function (i, v) {
            li += '<div class="swiper-slide" style="text-align: center">' +
                '<img data-src="' + v + '" class="swiper-lazy">' +
                '<div class="swiper-lazy-preloader"></div>' +
                '</div>';
        });
        var html = $('<article id="imageShow" class="image_show">' +
            '<div class="cover"></div>' +
            '<div class="close_img"></div>' +
            '<strong>1 / ' + images.length + '</strong>' +
            '<div class="slide_wrap" style="position: relative;top: 50%;transform: translate(0,-50%);-webkit-transform: translate(0,-50%)">">' +
            '<div class="swiper-wrapper">' +
            li +
            '</div>' +
            '</div>' +
            '</article>');
        html.appendTo($('body')).find('.cover,.close_img').click(function () {
            html.remove();
        });
        new Swiper('.image_show .slide_wrap', {
            initialSlide: index,
            lazyLoading: true,
            onSlideChangeEnd: function (swiper) {
                html.find('strong').html(swiper.activeIndex + 1 + ' / ' + images.length);
            }
        });
    }

    $(document).on('click', '.upload_item .upload_show', function () {
        var index = $(this).parents('.upload_item').index();
        var arr = [];
        $(this).parents('.upload_wrap').find('.upload_item').each(function () {
            if ($(this).find('.upload_show').length) {
                arr.push($(this).find('img').attr('data-src'));
            }
        });
        createSwiper(arr, index);
    });
})();