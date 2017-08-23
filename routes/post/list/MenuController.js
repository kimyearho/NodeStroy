/**
 * Created by Administrator on 2016-11-07.
 */

var menuController =
    function
        (
            $scope,
            $sce,
            $http,
            $window,
            $location,
            $stateParams,
            Pagination
        )
    {

    // init
    $scope.postData = [];
    $scope.apiUrl = '';
    $scope.path = '';

    var unhide = $('#fullmenu').hasClass('unhide');
    if(unhide) {
        $('#navmenu').trigger('click');
    }

    // 페이지 별 path
    var pathname = location.pathname;
    if(pathname == '/it' || pathname == '/games' || pathname == '/myStory')
        $scope.path = pathname;
    else
        $scope.path = location.pathname.substring(location.pathname.indexOf('/'), location.pathname.lastIndexOf('/'));

    // 페이지 별 요청 API URL
    if($stateParams.page != undefined) {
        // 각 페이지 URL 에 페이지 번호로 요청 된 경우
        if($scope.path == '/it')
            $scope.apiUrl = 'http://'+host+'/api/v0.1/getPostItList/'+$stateParams.page;
        else if($scope.path == '/games')
            $scope.apiUrl = 'http://'+host+'/api/v0.1/getPostGamesList/'+$stateParams.page;
        else if($scope.path == '/myStory')
            $scope.apiUrl = 'http://'+host+'/api/v0.1/getMyStoryList/'+$stateParams.page;
    } else {
        // 각 페이지 URL 이 기본일 경우
        if($scope.path == '/it')
            $scope.apiUrl = 'http://'+host+'/api/v0.1/getPostItList';
        else if($scope.path == '/games')
            $scope.apiUrl = 'http://'+host+'/api/v0.1/getPostGamesList';
        else if($scope.path == '/myStory')
            $scope.apiUrl = 'http://'+host+'/api/v0.1/getMyStoryList';
    }

    /**
     * init
     */
    $scope.viewInit = function() {
        $http({
            method: 'GET' ,
            url: $scope.apiUrl
        }).success(function(data) {
            $scope.itList = data.rows;
            $scope.listCount = data.rows.length;
            $window.scrollTo(0, 0);
            pagination(data.totalCount[0].COUNT, $stateParams.page);
        }).error(function(data) {
            console.log('Error: ' + data);
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

    function pagination(count, currentPage) {
        if(currentPage == undefined) currentPage = 1;
        var pagination = $scope.pagination = Pagination.create({
            itemsPerPage: 10,
            itemsCount: count,
            maxNumbers: 5,
            startPage : 1,
            currentPage : currentPage
        });

        pagination.onChange = function(page) {
            $location.url($scope.path + '/' + page);
        };

    }

}