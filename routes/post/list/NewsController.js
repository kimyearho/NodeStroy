/**
 * Created by Administrator on 2016-11-07.
 */

var newsController =
    function
        (
            $scope,
            $sce,
            $http,
            $window,
            $location,
            $stateParams
        )
    {

    // init
    $scope.postData = [];

    var unhide = $('#fullmenu').hasClass('unhide');
    if(unhide) {
        $('#navmenu').trigger('click');
    }

    /**
     * init
     */
    $scope.viewInit = function() {
        $http({
            method: 'GET' ,
            url: 'http://'+host+'/api/v0.1/getBreakNewView/'+$stateParams.id,
        }).success(function(data) {
            $scope.postData = data;
            $scope.body = $scope.postData[0].postBody;
            $scope.id = $stateParams.id;
            $window.scrollTo(0, 0);
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

};