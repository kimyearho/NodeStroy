//const host = "150.95.137.151:8002";
const host = "192.168.0.3:8002";

// Angular Modules load
var app = angular.module('nodeapp', [
    'ngAnimate',
    'ui.router',
    'anim-in-out',
    'wl-ng-weather',
    'angularPagination',
    '720kb.socialshare',
    'ngMeta'
])
    .value('bins', 'assets/bins')
    .value('apikey', 'a8f0dcf38a985e8f8d69ee658a31a4d7')
    .factory('socket', function() {
        return io.connect('http://' + host);
    })
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider, ngMetaProvider) {
        ngMetaProvider.setDefaultTitle('NodeStory 블로그');
        $urlRouterProvider.otherwise('/')
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');
        $stateProvider
            .state('main', {
                url : '/',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/list/postList.html',
                        controller: 'mainCtrl',
                    }
                },
            })
            .state('postView', {
                url : '/post/:id',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/content/postView.html',
                        controller: 'viewCtrl'
                    }
                }
            })
            .state('newsView', {
                url : '/news/:id',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/content/postView.html',
                        controller: 'newCtrl'
                    }
                }
            })
            .state('itList', {
                url : '/it',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/list/postMenuList.html',
                        controller: 'menuCtrl'
                    }
                }
            })
            .state('itPageList', {
                url : '/it/:page',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/list/postMenuList.html',
                        controller: 'menuCtrl'
                    }
                }
            })
            .state('gameList', {
                url : '/games',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/list/postMenuList.html',
                        controller: 'menuCtrl'
                    }
                }
            })
            .state('gamePageList', {
                url : '/games/:page',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/list/postMenuList.html',
                        controller: 'menuCtrl'
                    }
                }
            })
            .state('mystory', {
                url : '/myStory',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/list/postMenuList.html',
                        controller: 'menuCtrl'
                    }
                }
            })
            .state('history', {
                url : '/history',
                views : {
                    'contents' : {
                        templateUrl: 'template/post/list/postWebHistory.html'
                    }
                }
            })

    })
    .run(function($rootScope, $state, $location, $window, ngMeta) {
        ngMeta.init();

        $window.ga('create', 'UA-86966651-1', 'auto');

        // track pageview on state change
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
        });

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
                }

                // Start the timer
                $timeout(tick, $scope.tickInterval);

                $http.get('http://'+host+'/api/v0.1/topBreaknewsList')
                    .success(function(data) {
                        $scope.topBreaknewsList = data;
                    })
                    .error(function(data) {
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
                $http.get('http://'+host+'/api/v0.1/getPopularList')
                    .success(function(data) {
                        $scope.popularList = data;
                    })
                    .error(function(data) {
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
    .directive('feedback', function() {
        return {
            restrict : 'E',
            templateUrl : 'template/post/content/postFeedback.html'
        }
    })
    .controller('menuCtrl', menuController);


function topMenuSpinTrigger() {
    var unhide = $('#fullmenu').hasClass('unhide');
    if(unhide) {
        $('#navmenu').trigger('click');
    }
}