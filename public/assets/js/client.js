$(function () {
	
	// 소켓 서버 연결	
	var socket = io('http://localhost:8001');

    socket.emit('RequestRealTimeUsers');

    $('.aplayer-pic').attr('style', 'background-size: cover;background-position-x: 40%;');

}); // end jQuery

