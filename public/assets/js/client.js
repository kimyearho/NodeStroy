$(function () {
	
	// 소켓 서버 연결	
	var socket = io('http://nodestory.com');

    socket.emit('RequestRealTimeUsers');

}); // end jQuery

