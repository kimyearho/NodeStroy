/**
 * Created by kim on 2016-10-11.
 */

/** 전역적으로 공통으로 사용될 로그함수 */
const message = {
    
    // 임시 웹툰폴더 생성로그
    CREATE_TEMP_FOLDER_MSG : function(webtoon_title) {
        return console.log('================ ' + webtoon_title + ' 임시폴더 생성완료.');
    } ,

    // 임시 웹툰파일검사 로그
    FILE_VALIDATION_CHAECKS : function() {
        return console.log('================ 웹툰 파일검사 완료');
    } ,

    // 임시웹툰 압축시작 로그
    FILE_ZIP_START : function() {
        return console.log('================ 웹툰 압축시작');
    } ,
    
    // 임시웹툰 압축종료 로그
    FILE_ZIP_SUCCESS : function() {
        return console.log('================ 웹툰 압축완료');
    } ,

    // 임시웹툰 압축실패 로그
    FILE_ZIP_FAIL : function() {
        return console.log('================ 웹툰 압축실패');
    } ,

    // 임시웹툰 삭제 로그
    TEMP_FOLDER_DELETE : function() {
        return console.log('================ 임시웹툰폴더 삭제완료');
    } ,

    // 임시웹툰 삭제 로그
    TEMP_FILE_DELETE : function() {
        return console.log('================ 임시웹툰 삭제완료');
    } ,

}

// 모듈 익스포트
module.exports = message;
