/**
 * Created by Administrator on 2016-11-19.
 */

var chatController =
    function
        (
            $scope,
            $window
        )

    {
        console.log(location.pathname)
        if(location.pathname == '/chatchat') {
            $('#innerRow').hide();
        }

    }