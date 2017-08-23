/**
 * Created by Administrator on 2016-11-07.
 */

var mainController =
    function
        (
            $scope,
            $sce,
            $http,
            $location,
            $compile,
            $window,
            $timeout,
            socket,
            Socialshare
        )
    {

    $scope.mainPost = [];

    topMenuSpinTrigger();

    $('.wrapper_view').hide();
    $('#innerRow').show();
    $window.scrollTo(0, 0);

    /**
     * init
     */
    $scope.init = function() {

        // Main Post list
        $http.get('http://'+host+'/api/v0.1/getPostList').success(function(data) {
            $scope.mainPost = data;
        }).error(function(data) {
            console.log('Error: ' + data);
        });

        $http.get('http://'+host+'/api/v0.1/getBreakNews').success(function(data) {
            $scope.breakNews = data;
        }).error(function(data) {
            console.log('Error: ' + data);
        });

    }

    /**
     * PostLink
     * @param _id
     */
    $scope.postLink = function(_id) {
        $location.url("/post/" + _id);
    }

    /**
     * PostLink
     * @param _id
     */
    $scope.breakNewsLink = function(_id) {
        $location.url("/news/" + _id);
    }

    /**
     * Json String to html
     * @param html_code
     * @returns {*}
     */
    $scope.renderHtml = function(html_code) {
        return $sce.trustAsHtml(html_code);
    }

    // 기본 페이스북 공유
    $scope.share = function(post){
        var local = 'http://nodestory.com';  // production
        FB.ui(
            {
                method: 'feed', // 타입
                name: post.POST_TITLE,   // Feed 제목
                link: local+'/post/'+post.POST_SEQ,          // 공유 URL
                picture: local+'/'+post.MAIN_IMAGE,    // Feed 이미지
                description: 'Come to NodeStory Blog of dreams and hope!' // Feed 내용
            });
    }

    // 더 보기 했을때 페이스북 공유
    $scope.shareMore = function(post_seq, post_title, post_image){
        var local = 'http://nodestory.com';  // production
        FB.ui(
            {
                method: 'feed', // 타입
                name: post_title,   // Feed 제목
                link: local+'/post/'+post_seq,          // 공유 URL
                picture: local+'/'+post_image,    // Feed 이미지
                description: 'Come to NodeStory Blog of dreams and hope!' // Feed 내용
            });
    }
    
    // 트위터 공유
    $scope.twitterShare = function(post) {
        var local = 'http://nodestory.com';  // production
        Socialshare.share({
            'provider': 'twitter',
            'attrs': {
                'socialshareUrl': local + '/post/' + post.POST_SEQ,
                'socialshareText' : post.POST_TITLE,
                'socialshareVia' : 'nodestory',
                'socialshareHashtags': 'nodestory, twitter, share'
            }
        });
    }
    
    // 더보기 공유
    $scope.twitterShare_More = function(post_seq, post_title) {
        var local = 'http://nodestory.com';  // production
        Socialshare.share({
            'provider': 'twitter',
            'attrs': {
                'socialshareUrl': local + '/post/' + post_seq,
                'socialshareText' : post_title,
                'socialshareVia' : 'nodestory',
                'socialshareHashtags': 'nodestory, twitter, share',
                'popupHeight': 400,
                'popupWidth' : 400
            }
        });
    }

    /**
     * Load More POST
     * @param next_count
     */
    $scope.nextPage = function() {
        var next_count = $('#load').attr('page');
        $.ajax({
            type: 'GET',
            url: 'http://'+host+'/api/v0.1/getPostList/'+next_count,
            cache: 'false',
            success : function(data) {
                for(var i=0; i < data.rows.length; i++) {
                    // DataBinding tag set
                    var template = createPostHtml(data.rows[i]);
                    // tag set add, but this angular event apply compile
                    $('#postList').append($compile(template)($scope)).children(':last').hide().fadeIn(2000);
                    // repeat li offset value
                    var offset = $('#postList li').last().offset();
                    // animation start
                    $('html, body').animate({scrollTop : offset.top - 200}, 1500);
                    setTimeout(function(){
                        // 1.5 second stop
                        $('html, body').stop();
                    }, 1500)
                }
                if(data.pageEnd == 'Y') {
                    $('#load').text('마지막 페이지 입니다.');
                }
                $('#load').attr('page', Number(next_count) + 5);
            }
        })
    }

    /**
     * CREATE POST Socket.io
     */
    socket.on('ResponseBreakNewsInsertAPI', function(data) {
        // scope repeat reload compile
        $scope.$apply(function() {
            $scope.breakNews.unshift({
                POST_SEQ : data[0].POST_SEQ,
                MAIN_IMAGE : data[0].MAIN_IMAGE,
                CATEGORY : data[0].CATEGORY,
                POST_TITLE : data[0].POST_TITLE,
                TIMER : data[0].TIMER,
                COMMENT_COUNT : data[0].COMMENT_COUNT
            });
        });
    });

    /**
     * CREATE POST Socket.io
     */
    socket.on('ResponsePostInsertAPI', function(data) {
        // scope repeat reload compile
        $scope.$apply(function() {
            $scope.mainPost.unshift({
                POST_SEQ : data[0].POST_SEQ,
                MAIN_IMAGE : data[0].MAIN_IMAGE,
                CATEGORY : data[0].CATEGORY,
                POST_TITLE : data[0].POST_TITLE,
                TIMER : data[0].TIMER,
                COMMENT_COUNT : data[0].COMMENT_COUNT
            });
        });
    });

    /**
     * LoadMore
     * @param data
     * @returns {string}
     */
    function createPostHtml(data) {
        var title = data.POST_TITLE;
        var html = ' <li class="logEntry"><div class="unimedia-cell">'
            + '<div class="unimedia-img">'
            + '<a class="img-link"><img class="cover-img" ng-src="'+data.MAIN_IMAGE+'" src="'+data.MAIN_IMAGE+'" alt="" /></a>'
            + ' </div></div>'
            + '<div class="unimedia-cell cell-max">'
            + '<h5 class="unimedia-subtitle fg-accent hidden-xs"><a>'+data.C_NAME+'</a></h5>'
            + '<h4 class="unimedia-title"><a style="cursor: pointer;" ng-click="postLink(\''+data.POST_SEQ+'\')">'+data.POST_TITLE+'</a></h4>'
            + '<div class="unimeta post-meta hidden-xs">'
            + '<span><i class="ti-time fg-text-l"></i>'+data.TIMER+'</span>'
            + '<span><i class="ti-comment-alt fg-text-l"></i>'+data.COMMENT_COUNT+' comments</span>'
            + '</div>'
            + '<div class="unimeta post-meta hidden-xs"><ul class="uninav uninav-icons color-icons-bg uninav-sm">'
            + '<li><a class="cursor" ng-click="shareMore(\''+data.POST_SEQ+'\', \''+data.POST_TITLE+'\', \''+data.MAIN_IMAGE+'\')" class="fb-share-button"><img src="images/1476360313_Facebook.png" width="25"/></a></li>'
            + '<li style="margin-left: 5px;"><a class="cursor" ng-click="twitterShare_More(\''+data.POST_SEQ+'\', \''+data.POST_TITLE+'\', \''+data.MAIN_IMAGE+'\')" socialshare socialshare-provider="twitter"><img src="images/1476361212_square-twitter.png" width="25"/></a></li>'
            + '</a></li>  </ul></div>'
            + '</div></li>';
        return html;

    }
}