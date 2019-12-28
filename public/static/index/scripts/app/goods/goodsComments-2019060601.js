var isCommet2 = $('#goodsComments2').length;

//获取商品评论
function getComments(twoPostID, page, pageCount, fn) {
    $.ajax({
        method: 'get',
        url: '/goods/get-comment.html',
        data: {
            twoPostID: twoPostID,
            type: 1,
            page: page,
            pageCount: pageCount
        }
    }).done(function (data) {
        if (data.error === 0) {
            fn.success && fn.success(data);
        } else {
            fn.fail && fn.fail(data);
        }
    }).always(function () {
        fn.always && fn.always();
    });
}

var goodsCommentsObj = new Vue({
    el: '#goodsComments',
    data: {
        commentList: [],
        goodsImgs: ['https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201902/20021/list_20021.jpg?v=1555669002',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201811/18513/list_18513.jpg?v=1555669722',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201903/20488/list_20488.jpg?v=1555903396',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201301/10923/list_10923.jpg?v=1555671032',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201903/20480/list_20480.jpg?v=1555668617',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201303/12085/list_12085.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201903/20484/list_20484.jpg?v=1555671046',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201305/12152/list_12152.jpg?v=1556271455',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201902/20021/list_20021.jpg?v=1555669002',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201811/18513/list_18513.jpg?v=1555669722',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201903/20488/list_20488.jpg?v=1555903396',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201301/10923/list_10923.jpg?v=1555671032',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201903/20480/list_20480.jpg?v=1555668617',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201303/12085/list_12085.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201903/20484/list_20484.jpg?v=1555671046',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201305/12152/list_12152.jpg?v=1556271455',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201310/12287/list_12287.jpg?v=1537520951',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201306/12186/list_12186.jpg?v=1556265289',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201807/17113/list_17113.jpg?v=1555668758',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201707/15532/list_15532.jpg?v=1524902050',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201505/13403/list_13403.jpg?v=1524901925',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201901/16154/list_16154.jpg?v=1552299659',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201308/12244/list_12244.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201307/12220/list_12220.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201211/10491/list_10491.jpg?v=1529291174',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201211/10479/list_10479.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201812/19428/list_19428.jpg',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201812/18609/list_18609.jpg?v=1544005765',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201810/18602/list_18602.jpg?v=1555668988',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201810/18764/list_18764.jpg?v=1540892595',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201508/13664/list_13664.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201401/12486/list_12486.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201211/10473/list_10473.jpg?v=1544519035',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201212/10648/list_10648.png?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201505/13490/list_13490.jpg?v=1529284307',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201801/15965/list_15965.jpg?v=1523519088',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201212/10782/list_10782.jpg?v=1555669727',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201309/12253/list_12253.jpg?v=1529284330',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201212/10678/list_10678_o.jpg?v=1525770708',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201305/12134/list_12134.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201503/13345/list_13345.jpg?v=1522743650',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201212/10800/list_10800.jpg?v=1552880056',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201902/19907/list_19907.jpg?v=1555671037',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201811/18525/list_18525.jpg?v=1555669714',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201903/20027/list_20027.jpg?v=1555668998',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201812/13164/list_13164.jpg?v=1555669191',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201904/20255/list_20255.jpg?v=1555945298',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201803/16196/list_16196.jpg?v=1531882379',
            'https://imagecdn.lapetit.cn/postsystem/docroot/images/goods/201706/15474/list_15474.jpg?v=1529291148'],
        twoPostID: 0,
        page: 0,
        pageCount: 10,
        needGetMore: false,
        isFetching: true,
        hasMore: false,
        isFetchingMore: false
    },
    created: function () {
        this.twoPostID = $('#twoPostID').val();
        this.pageCount = parseInt($('#pageCount').val());
        this.needGetMore = parseInt($('#needGetMore').val());
        this.getMore();
        if (this.needGetMore) {
            this.handleScroll();
        }
    },
    methods: {
        //获取商品评论
        getMore: function () {
            var self = this,
                currentPage = self.page + 1;
            self.isFetchingMore = true;
            getComments(this.twoPostID, currentPage, this.pageCount, {
                success: function (data) {
                    if (data && data.list && data.list.length) {
                        data.list.forEach(function (item) {
                            if (item.creator) {
                                var baseNum = parseInt(item.pcustid);
                                item.avatar = self.goodsImgs[baseNum % self.goodsImgs.length];
                            } else {
                                item.avatar = self.goodsImgs[utils.rand(0, self.goodsImgs.length - 1)];
                            }
                        });
                        self.commentList = self.commentList.concat(data.list);
                        self.hasMore = data.total > self.commentList.length;
                        self.page = currentPage;
                        // 筛选前两条放到页面前面
                        if (isCommet2 === 1) {
                            goodsCommentsObj2.commentList = data.list.filter(function (item, index) {
                                return index < 2;
                            });
                            goodsCommentsObj2.hasMore = data.total > 2;
                        }
                    }
                },
                always: function () {
                    self.isFetching = false;
                    self.isFetchingMore = false;
                }
            });
        },
        handleScroll: function () {
            var self = this;
            $(window).scroll(function () {
                if (!self.hasMore || self.isFetchingMore) {
                    return;
                }
                if ($(window).scrollTop() + $(window).height() > $(document).height() - 50) {
                    self.getMore();
                }
            });
        }
    }
});
if (isCommet2 === 1) {
    var goodsCommentsObj2 = new Vue({
        el: '#goodsComments2',
        data: {
            commentList: [],
            hasMore: false
        }
    });
}
