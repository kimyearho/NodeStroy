/**
 * Created by Administrator on 2016-11-07.
 */

var viewController =
    function
        (
            $rootScope,
            $scope,
            $sce,
            $http,
            $window,
            $location,
            $stateParams,
            $compile,
            socket,
            Socialshare,
            ngMeta
        )
    {

    // init
    $scope.postData = [];
    $scope.postComment = [];

    // menu init
    topMenuSpinTrigger();

    $('.wrapper').hide();

    /**
     * init
     */
    $scope.viewInit = function() {
        // 본문
        $http({
            method: 'GET' ,
            url: 'http://'+host+'/api/v0.1/getPostView/'+$stateParams.id
        }).success(function(data) {

            ngMeta.setTitle(data.postContents.POST_TITLE);
            ngMeta.setTag('url', 'http://nodestory.com/post/' + data.postContents.POST_SEQ);
            ngMeta.setTag('description', 'NodeStory 블로그에서 "' + data.postContents.POST_TITLE + '" 내용을 확인하세요!');

            $scope.postData = data.postContents;
            $scope.postRandom = data.postRandom;
            $scope.id = $stateParams.id;
            $scope.postComment = data.postCommentList;
            $scope.postCommentCount = data.postCommentList.length;
            $window.scrollTo(0, 0);
            $('.related').removeClass('related');
        }).error(function(data) {
            console.log('Error: ' + data);
        });
    }

    /**
     * 코멘트 등록
     * @param _id
     */
    $scope.insertComment = function(_id) {
        // validation check
        if( $scope.comment_who == undefined ) {
            alert('작성자를 입력하세요.');
            return false;
        } else if ( $scope.comment_content == undefined ) {
            alert('코멘트 내용을 입력하세요.');
            return false;
        } else {
            var data = {
                'post_seq' : _id ,
                'comment_who' : $scope.comment_who ,
                'comment_email' : $scope.comment_email ,
                'comment_content' : replaceAll($scope.comment_content, '\n', '<br/>')
            };
            $http({
                method : 'POST',
                url : 'http://'+host+'/api/v0.1/insertComment',
                data : $.param(data),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data) {
                socket.emit('RequestCommentInsertAPI', data);
                $scope.comment_who = '';
                $scope.comment_email = '';
                $scope.comment_content = '';
            }).error(function(data) {
                console.log('Error: ' + data);
            });
        }
    }

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

    /**
     * JSON 데이터를 HTML로 표현하기위한 함수
     * @param html_code
     * @returns {*}
     */
    $scope.renderHtml = function(html_code) {
        return $sce.trustAsHtml(html_code);
    }

    /**
     * 포스트
     * @param _id
     */
    $scope.postLink = function(_id) {
        $location.url("/post/" + _id);
    }

    /**
     * CREATE COMMENT Socket.io
     */
    socket.on('ResponseCommentInsertAPI', function(data) {
        $scope.$apply(function() {
            $scope.postComment.unshift({
                PROFILE_IMAGE : data[0].PROFILE_IMAGE,
                COMMENT_NAME : data[0].COMMENT_NAME,
                WRT_DTM : data[0].WRT_DTM,
                COMMENT_CONTENT : data[0].COMMENT_CONTENT,
                COMMENT_LIKE : data[0].COMMENT_LIKE,
                COMMENT_UNLIKE : data[0].COMMENT_UNLIKE
            });
            $scope.postCommentCount = $scope.postComment.length ;
        });
    });

    /**
     * 문자열 재정의
     * @param str
     * @param target
     * @param replacement
     * @returns {string}
     */
    function replaceAll(str, target, replacement) {
        return str.split(target).join(replacement);
    };

}