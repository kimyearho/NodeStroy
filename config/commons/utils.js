/**
 * Created by kim on 2016-10-11.
 */

/** 전역적으로 공통으로 사용될 유틸함수 */

var utils = {

    // 넘어온 값이 빈값인지 체크합니다.
    // !value 하면 생기는 논리적 오류를 제거하기 위해
    // 명시적으로 value == 사용
    // [], {} 도 빈값으로 처리
    isEmpty : function(value) {
        if( value == "" || value == null
            || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
            return true
        }else{
            return false
        }
    }

}

// 모듈 익스포트
module.exports = utils;
