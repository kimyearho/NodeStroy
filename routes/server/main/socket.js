console.log("======================================================");
console.log("   Socket.io Server has started");
console.log("======================================================");

// 쿼리 모델정의
let postModel = require('../../../config/models/postModel');

// 도큐먼트 사용준비
module.exports = function(app, db, io, pub, sub) {

    let socket_ids = [];

    // 소켓연결 대기
    io.on('connection', function(socket) {

        // 사용자 접속 요청
        socket.on('RequestRealTimeUsers', function () {

            // 1000000의 랜덤난수를 구하여 유저번호를 생성.
            let userNo = Math.floor(Math.random() * 1000000) + 1;
            socket.nickname = userNo;
            socket_ids[socket.nickname] = socket.id;

            io.emit('socket_id', userNo);

            // 클라이언트로 사용자 전송
            io.emit('ResRealUserListSocketConnection', { 'users' : Object.keys(socket_ids) } );
        });

        // 접속종료 이벤트
        socket.on('disconnect', function() {
            if(socket.nickname != undefined) {
                // 소켓제거
                delete socket_ids[socket.nickname];
                console.log('socket delete !');

                io.emit('ResRealUserListSocketConnection', { 'users' : Object.keys(socket_ids)});
            } else {
                return false;
            }
        });

        // RequestPostInsertAPI 요청이 오면 실행한다.
        socket.on('RequestPostInsertAPI', function () {
            // 목록을 조회하는데, 역순으로 조회하며 1개만 조회한다.
            let limit_count = 1;
            db.query(postModel.postList(), [limit_count], function (err, rows) {
                if (err) throw err;
                io.emit('ResponsePostInsertAPI', rows);
            });
        });

        // RequestBreakNewsInsertAPI 요청이 오면 실행한다.
        socket.on('RequestBreakNewsInsertAPI', function () {
            // 목록을 조회하는데, 역순으로 조회하며 1개만 조회한다.
            db.query(postModel.breakNewsList(), function (err, rows) {
                if (err) throw err;
                io.emit('ResponseBreakNewsInsertAPI', rows);
            });
        });
    });
};