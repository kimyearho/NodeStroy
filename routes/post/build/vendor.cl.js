var mainController =
    function
        (
            $scope,
            $http,
            $location,
            $compile,
            $window,
            $timeout,
            socket,
            Socialshare
        )
    {

        topMenuSpinTrigger();

        $('.wrapper_view').hide();
        $('#innerRow').show();

        // Real-time users
        //socket.emit('RequestReal-timeUsers');

        // Main Post list
        $http.get('http://'+host+'/api/v0.1/getPostList').success(function(data) {
            $scope.mainPost = data.postList;
            $scope.breakNews = data.news;
        }).error(function(data) {
            console.log('Error: ' + data);
        });

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
                    $('#load').attr('page', Number(next_count) + 6);
                }
            })
        }

        socket.on('ResRealUserListSocketConnection', function(data) {
            // scope repeat reload compile
            $scope.$apply(function() {
                $('#userCount').html('<strong>' + data.users.length + '</strong>');
            });
        });

        socket.on('socket_id', function(data) {
            // scope repeat reload compile
            $scope.$apply(function() {
                $('#nickname').val(data);
            });
        });

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
                + '<h5 class="unimedia-subtitle fg-accent hidden-xs" style="display:inline-block"><a>'+data.C_NAME+'</a></h5>'
                + '<span class="post_date"><i class="ti-time fg-text-l"></i> '+ data.TIMER+'</span>'
                + '<h4 class="unimedia-title"><a style="cursor: pointer;" ng-click="postLink(\''+data.POST_SEQ+'\')">'
                +  data.POST_TITLE+'</a></h4>'
                + '<div class="unimeta post-meta hidden-xs" style="font-size: 12px;">'
                +  data.NONE_BODY+ '<a class="post_link" ng-click="postLink(\''+data.POST_SEQ+'\')">더보기</a>'
                + '</div>';
                + '</div></li>';
            return html;

        }
    };

var viewController =
    function
        (
            $scope,
            $http,
            $window,
            $stateParams,
            $location,
            ngMeta,
            ezfb
        )
    {

        $('.wrapper').hide();

        // menu init
        topMenuSpinTrigger();

        $scope.share = function (post) {
            var local = 'http://nodestory.com';  // production
            ezfb.ui(
                {
                    method: 'feed',
                    name: post.POST_TITLE,   // Feed 제목
                    picture: post.SHARE_IMAGE,    // Feed 이미지
                    link: local+'/post/'+post.POST_SEQ,          // 공유 URL
                    description: 'Come to NodeStory Blog of dreams and hope!' // Feed 내용
                },
                function (res) {
                    // res: FB.ui response
                }
            );
        };

        $http.get('http://'+host+'/api/v0.1/getPostView/'+$stateParams.id).success(function(data) {
            if(data.code != 1) {

                ngMeta.setTitle(data.postContents.POST_TITLE);
                ngMeta.setTag('url', 'http://nodestory.com/post/' + data.postContents.POST_SEQ);
                ngMeta.setTag('description', 'NodeStory 블로그에서 "' + data.postContents.POST_TITLE + '" 내용을 확인하세요!');

                $scope.postData = data.postContents;
                $scope.postRandom = data.postRandom;

                $scope.disqusConfig = {
                    disqus_shortname: 'nodeblog-1',
                    disqus_identifier: data.postContents.POST_SEQ,
                    disqus_url: 'http://nodestory.com/post/' + data.postContents.POST_SEQ
                };

                $('.related').removeClass('related');
            } else {
                alert("페이지가 존재하지 않습니다.");
                $location.url('/');
            }

        }).error(function(data) {
            console.log('Error: ' + data);
        });

    };

var wdmController =
    function
        (
            $scope,
            $http,
            $window,
            $stateParams,
            ngMeta
        )
    {

        location.href = "http://nodestory.com/webtoonManager.html";

    };

var menuController =
    function
        (
            $scope,
            $http,
            $window,
            $location,
            $stateParams,
            Pagination,
            ngMeta
        )
    {

        topMenuSpinTrigger();

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
        $http.get($scope.apiUrl).success(function(data) {
            $scope.itList = data.rows;
            $scope.listCount = data.rows.length;
            pagination(data.totalCount[0].COUNT, $stateParams.page);
        }).error(function(data) {
            console.log('Error: ' + data);
        });

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

    };


const host = "localhost:8001";

// Angular Modules load
var app = angular.module('nodeapp', [
    'ngAnimate',
    'ui.router',
    'anim-in-out',
    'wl-ng-weather',
    'angularPagination',
    '720kb.socialshare',
    'ezfb',
    'angularUtils.directives.dirDisqus',
    'ngMeta'
])
    .factory('socket', function() {
        return io.connect('http://'+host);
    })
    .value('bins', 'assets/bins')
    .value('apikey', 'a8f0dcf38a985e8f8d69ee658a31a4d7')
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, ngMetaProvider, ezfbProvider) {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');
        ezfbProvider.setInitParams({
            appId: '186709768436817'
        });
        $stateProvider.decorator('data', ngMetaProvider.mergeNestedStateData);
        $stateProvider
            .state('main', {
                url : '/',
                templateUrl: 'template/post/list/postList.html',
                controller: 'mainCtrl',
                data: {
                    meta: {
                        'title': 'NodeStory 블로그',
                        'description': '안녕하세요, 노드블에 들려주셔서 감사합니다. 홈페이지는 계속 개선해나가고 있습니다.',
                        'og:title': 'NodeStory 블로그 메인 페이지',
                        'og:type': 'website',
                        'og:locale': 'ko_KR',
                        'og:image': 'http://mblogthumb4.phinf.naver.net/20150415_183/durandot_1429090948123Hgeku_PNG/013.png?type=w2',
                        'og:description': 'This is the description shown in Google search results'
                    }
                }
            })
            .state('postView', {
                url : '/post/:id',
                templateUrl: 'template/post/content/postView.html',
                controller: 'viewCtrl'
            })
            .state('newsView', {
                url : '/news/:id',
                templateUrl: 'template/post/content/postView.html',
                controller: 'newCtrl'
            })
            .state('itList', {
                url : '/it',
                templateUrl: 'template/post/list/postMenuList.html',
                controller: 'menuCtrl'
            })
            .state('itPageList', {
                url : '/it/:page',
                templateUrl: 'template/post/list/postMenuList.html',
                controller: 'menuCtrl'
            })
            .state('gameList', {
                url : '/games',
                templateUrl: 'template/post/list/postMenuList.html',
                controller: 'menuCtrl'
            })
            .state('gamePageList', {
                url : '/games/:page',
                templateUrl: 'template/post/list/postMenuList.html',
                controller: 'menuCtrl'
            })
            .state('mystory', {
                url : '/myStory',
                templateUrl: 'template/post/list/postMenuList.html',
                controller: 'menuCtrl'
            })
            .state('webtoon', {
                url : '/webtoonList',
                controller: 'wdmCtrl',
                data: {
                    meta: {
                        'title': '웹툰 다운로드 매니저',
                        'description': '웹툰을 이제 파일로 다운받아서 소장하세요!',
                        'og:title': 'NodeStory 블로그 웹툰다운로드매니저',
                        'og:type': 'website',
                        'og:locale': 'ko_KR',
                        'og:image': 'http://mblogthumb4.phinf.naver.net/20150415_183/durandot_1429090948123Hgeku_PNG/013.png?type=w2',
                        'og:description': '웹툰을 이제 파일로 다운받아서 소장하세요!'
                    }
                }
            })
            .state('profile', {
                url : '/profile',
                templateUrl: 'template/post/web/profile.html'
            })
            .state('404', {
                url : '/404',
                templateUrl: 'template/error.html'
            })

    })
    .run(function($rootScope, $state, $location, $window, ngMeta, $sce, Socialshare) {
        ngMeta.init();
        $window.ga('create', 'UA-86966651-1', 'auto');
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.scrollTo(0, 0);
            $window.ga('send', 'pageview', $location.path());
        });

        /**
         * PostLink
         * @param _id
         */
        $rootScope.postLink = function(_id) {
            $location.url("/post/" + _id);
        };

        /**
         * PostLink
         * @param _id
         */
        $rootScope.breakNewsLink = function(_id) {
            $location.url("/news/" + _id);
        };

        /**
         * 웹툰 목록
         */
        $rootScope.webtoonList = function() {
            $location.url('/webtoonList');
        };

        /**
         * Json String to html
         * @param html_code
         * @returns {*}
         */
        $rootScope.renderHtml = function(html_code) {
            $('.wp-caption.aligncenter').removeAttr('style', 'width');
            return $sce.trustAsHtml(html_code);
        }

        // 기본 페이스북 공유
        $rootScope.share = function(post) {
            Socialshare.share({
                'provider': 'facebook',
                'attrs': {
                    'socialshareUrl': 'http://nodestory.com/post/'+post.POST_SEQ,
                }
            });
        };

        // 트위터 공유
        $rootScope.twitterShare = function(post) {
            Socialshare.share({
                'provider': 'twitter',
                'attrs': {
                    'socialshareUrl': 'http://nodestory.com/post/' + post.POST_SEQ,
                }
            });
        };
    })
    .controller('mainCtrl', mainController)
    .directive('navmenu', function($http, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'template/post/layout/navmenu.html',
            controller : function($scope) {
                $scope.clock = "시계 로딩 중..."; // initialise the time variable
                $scope.tickInterval = 1000 //ms
                var tick = function () {
                    $scope.clock = Date.now()
                    $timeout(tick, $scope.tickInterval); // reset the timer
                };
                // Start the timer
                $timeout(tick, $scope.tickInterval);
                $http.get('http://'+host+'/api/v0.1/topBreaknewsList').success(function(data) {
                        $scope.topBreaknewsList = data;
                    }).error(function(data) {
                        console.log('error : ' + data);
                })
            }
        }
    })
    .directive('popular', function($http) {
        return {
            restrict: 'E' ,
            templateUrl: 'template/post/list/postPopularList.html',
            controller : function($scope) {
                $http.get('http://'+host+'/api/v0.1/getPopularList').success(function(data) {
                        $scope.popularList = data;
                    }).error(function(data) {
                        console.log('error : ' + data);
                })
            }
        };
    })
    .directive('social', function() {
        return {
            restrict: 'E' ,
            templateUrl: 'template/post/list/postLinkList.html'
        };
    })
    .controller('viewCtrl', viewController)
    .controller('menuCtrl', menuController)
    .controller('wdmCtrl', wdmController);


function topMenuSpinTrigger() {
    var unhide = $('#fullmenu').hasClass('unhide');
    if(unhide) {
        $('#navmenu').trigger('click');
    }
}
