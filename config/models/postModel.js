/**
 * Created by kim on 2016-10-11.
 */

// 포스트 관련 쿼리 모델정의
var query = {

    /**
     * 메인 포스트 목록 조회
     * @param limit - 목록갯수
     * @returns {string}
     */
    postList : function() {
            var query1 = 'SELECT POST_SEQ, IFNULL(CONCAT(LEFT(NONE_BODY,130), " ..."), "미리보기가 없습니다") AS NONE_BODY, POST_TYPE, CASE CATEGORY WHEN "2101" THEN "IT / MOBILE" WHEN "2102" THEN "GAME" WHEN "2103" THEN "BREAKING STORY" WHEN "2104" THEN "MY STORY" END AS C_NAME, POST_TITLE, PROFILE_IMAGE, MAIN_IMAGE, TAG,';
            var query2 = 'DATE_FORMAT(TIMER, "%D %M %Y %T") AS TIMER, ACTIVE_YN FROM T_POSTLIST A WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1100" ORDER BY DATE_FORMAT(TIMER, "%Y-%m-%d %H:%i:%s") DESC LIMIT 0, ?';
        return query1.concat(query2);
    },

    /**
     * 브레이크뉴스 포스트 조회
     */
    breakNewsList : function() {
            var query1 = 'SELECT POST_SEQ, POST_TYPE, CASE CATEGORY WHEN "2101" THEN "IT / MOBILE" WHEN "2102" THEN "GAME" WHEN "2103" THEN "BREAKING STORY" WHEN "2104" THEN "MY STORY" END AS C_NAME, POST_TITLE, PROFILE_IMAGE, MAIN_IMAGE, TAG,';
            var query3 = 'DATE_FORMAT(TIMER, "%W %D %M %Y %T") AS TIMER, ACTIVE_YN FROM T_POSTLIST A WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1101" ORDER BY POST_SEQ DESC LIMIT 1 ';
        return query1.concat(query3);
    },

    /**
     * 포스트 상세페이지 조회
     * @param post_seq - 글 번호
     * @returns {string}
     */
    postFindOne : function() {
            var query1 = 'SELECT POST_SEQ, POST_TYPE, CASE CATEGORY WHEN "2101" THEN "IT / MOBILE" WHEN "2102" THEN "GAME" WHEN "2103" THEN "BREAKING STORY" WHEN "2104" THEN "MY STORY" END AS C_NAME, POST_TITLE, POST_BODY, PROFILE_IMAGE, MAIN_IMAGE, SHARE_IMAGE, TAG, ';
            var query2 = 'DATE_FORMAT(TIMER, "%D %M %Y") AS TIMER, ACTIVE_YN, SOURCE_ORIGIN FROM T_POSTLIST WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_SEQ = ?';
        return query1.concat(query2);
    },

    /**
     * 포스트 상세페이지 코멘트 조회
     */
    postFindCommentList : function() {
            var query1 = 'SELECT POST_SEQ, COMMENT_SEQ, COMMENT_RE_SEQ, COMMENT_NAME, COMMENT_EMAIL, COMMENT_CONTENT, ';
            var query2 = 'COMMENT_LIKE, COMMENT_UNLIKE, COMMENT_LEVEL, PROFILE_IMAGE, ACTIVE_YN, DATE_FORMAT(WRT_DTM, "%D %M %Y %T") as WRT_DTM ';
            var query3 = 'FROM T_COMMENT WHERE 1=1 AND POST_SEQ = ? ORDER BY DATE_FORMAT(WRT_DTM, "%Y-%m-%d %H:%i:%s") DESC';
        return query1.concat(query2).concat(query3);
    },

    /**
     *  포스트 코멘트 등록
     * @returns {string}
     */
    postInsetComment : function() {
            var query1 = 'INSERT INTO T_COMMENT';
            var query2 = '(POST_SEQ, COMMENT_NAME, COMMENT_EMAIL, COMMENT_CONTENT, PROFILE_IMAGE, WRT_DTM, MDY_DTM)';
            var query3 = 'VALUES(?, ?, ?, ?, ?, NOW(), NOW())';
        return query1.concat(query2).concat(query3);
    },

    /**
     * 포스트 등록한 코멘트 1건 조회
     */
    postFindOneComment : function() {
        var query1 = 'SELECT POST_SEQ, COMMENT_SEQ, COMMENT_RE_SEQ, COMMENT_NAME, COMMENT_EMAIL, COMMENT_CONTENT, ';
        var query2 = 'COMMENT_LIKE, COMMENT_UNLIKE, COMMENT_LEVEL, PROFILE_IMAGE, ACTIVE_YN, DATE_FORMAT(WRT_DTM, "%D %M %Y %T") as WRT_DTM ';
        var query3 = 'FROM T_COMMENT WHERE 1=1 AND POST_SEQ = ? AND COMMENT_SEQ = ?';
        return query1.concat(query2).concat(query3);
    },

    /**
     * 포스트 전체갯수 (BreakNews 제외)
     * @returns {string}
     */
    postFindCount : function() {
            var query1 = 'SELECT COUNT(*) AS TOTAL_COUNT FROM T_POSTLIST ';
            var query2 = 'WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = 1100';
        return query1.concat(query2);
    },

    /**
     * 메인 포스트 목록 조회
     * @param limit - 목록갯수
     * @returns {string}
     */
    randomPostList : function() {
            var query1 = 'SELECT POST_SEQ, POST_TYPE, CATEGORY, POST_TITLE, PROFILE_IMAGE, MAIN_IMAGE, TAG,';
            var query2 = 'DATE_FORMAT(TIMER, "%W %D %M %Y %T") AS TIMER, ACTIVE_YN FROM T_POSTLIST WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY != "2104" ORDER BY TIMER DESC LIMIT 3 OFFSET ?';
        return query1.concat(query2);
    },

    /**
     * 메인 포스트 목록 더보기
     * @param limit - 추가로드 갯수
     * @param offset - 시작지점
     * @returns {string}
     */
    loadMorePostList : function() {
            var query1 = 'SELECT POST_SEQ, POST_TYPE, IFNULL(CONCAT(LEFT(NONE_BODY,120), " ..."), "미리보기가 없습니다") AS NONE_BODY, CASE CATEGORY WHEN "2101" THEN "IT / MOBILE" WHEN "2102" THEN "GAME" WHEN "2103" THEN "BREAKING STORY" WHEN "2104" THEN "MY STORY" END AS C_NAME, POST_TITLE, PROFILE_IMAGE, MAIN_IMAGE, TAG,';
            var query2 = 'DATE_FORMAT(TIMER, "%D %M %Y %T") AS TIMER, ACTIVE_YN FROM T_POSTLIST A WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1100" ORDER BY DATE_FORMAT(TIMER, "%Y-%m-%d %H:%i:%s") DESC LIMIT ?, ?'
        return query1.concat(query2);
    },

    /**
     * IT 메뉴 목록
     * @returns {string}
     */
    postListIT : function() {
            var query1 = 'SELECT POST_SEQ, POST_TYPE, IFNULL(CONCAT(LEFT(NONE_BODY,120), " ..."), "미리보기가 없습니다") AS NONE_BODY, CASE CATEGORY WHEN "2101" THEN "IT / MOBILE" WHEN "2102" THEN "GAME" WHEN "2103" THEN "BREAKING STORY" WHEN "2104" THEN "MY STORY" END AS C_NAME, POST_TITLE, PROFILE_IMAGE, MAIN_IMAGE, TAG,';
            var query2 = 'DATE_FORMAT(TIMER, "%W %D %M %Y %T") AS TIMER, ACTIVE_YN FROM T_POSTLIST A WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2101" ORDER BY DATE_FORMAT(TIMER, "%Y-%m-%d %H:%i:%s") DESC LIMIT ?, ?';
        return query1.concat(query2);
    },

    /**
     * Games 메뉴 목록
     * @returns {string}
     */
    postListGames : function() {
            var query1 = 'SELECT POST_SEQ, POST_TYPE, IFNULL(CONCAT(LEFT(NONE_BODY,120), " ..."), "미리보기가 없습니다") AS NONE_BODY, CASE CATEGORY WHEN "2101" THEN "IT / MOBILE" WHEN "2102" THEN "GAME" WHEN "2103" THEN "BREAKING STORY" WHEN "2104" THEN "MY STORY" END AS C_NAME, POST_TITLE, PROFILE_IMAGE, MAIN_IMAGE, TAG,';
            var query2 = 'DATE_FORMAT(TIMER, "%W %D %M %Y %T") AS TIMER, ACTIVE_YN FROM T_POSTLIST A WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2102" ORDER BY DATE_FORMAT(TIMER, "%Y-%m-%d %H:%i:%s") DESC LIMIT ?, ?';
        return query1.concat(query2);
    },

    /**
     * MY STORY 메뉴 목록
     * @returns {string}
     */
    postMyStoryList : function() {
            var query1 = 'SELECT POST_SEQ, POST_TYPE, IFNULL(CONCAT(LEFT(NONE_BODY,120), " ..."), "미리보기가 없습니다") AS NONE_BODY, CASE CATEGORY WHEN "2101" THEN "IT / MOBILE" WHEN "2102" THEN "GAME" WHEN "2103" THEN "BREAKING STORY" WHEN "2104" THEN "MY STORY" END AS C_NAME, POST_TITLE, PROFILE_IMAGE, MAIN_IMAGE, TAG,';
            var query2 = 'DATE_FORMAT(TIMER, "%W %D %M %Y %T") AS TIMER, ACTIVE_YN FROM T_POSTLIST A WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2104" ORDER BY DATE_FORMAT(TIMER, "%Y-%m-%d %H:%i:%s") DESC LIMIT ?, ?';
        return query1.concat(query2);
    },

    /**
     * 인기글 리스트
     * @returns {string}
     */
    postPopularList : function() {
            var query1 = 'SELECT A.POST_SEQ, A.POST_TITLE, A.MAIN_IMAGE, B.POST_VIEW_COUNT FROM T_POSTLIST A ';
            var query2 = 'LEFT OUTER JOIN T_POSTSTATS B ON A.POST_SEQ = B.POST_SEQ WHERE 1=1 ';
            var query3 = 'AND A.POST_TYPE = "1100" AND A.CATEGORY != "2104" AND A.ACTIVE_YN = "Y" AND B.POST_VIEW_COUNT IS NOT NULL ORDER BY B.POST_VIEW_COUNT DESC LIMIT 5';
        return query1.concat(query2).concat(query3);
    },

    /**
     * top break news List
     * @returns {string}
     */
    postTopBreaknewsList : function() {
            var query1 = 'SELECT POST_SEQ, CONCAT(LEFT(POST_TITLE, 15), " ...") AS POST_TITLE, MAIN_IMAGE, ACTIVE_YN ';
            var query2 = 'FROM T_POSTLIST A WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1101" ORDER BY DATE_FORMAT(TIMER, "%Y-%m-%d %H:%i:%s") DESC LIMIT 4 ';
        return query1.concat(query2);
    },

    /**
     * 포스트 등록
     * @returns {string}
     */
    postInsertPost : function() {
        var query1 = "INSERT INTO T_POSTLIST (POST_TYPE, CATEGORY, POST_TITLE, POST_BODY, PROFILE_IMAGE, MAIN_IMAGE, TAG, TIMER, ACTIVE_YN, SOURCE_ORIGIN) ";
        var query2 = " VALUES ('1100', ?, ?, ?, ?, ?, '', NOW(), 'Y', ?)";
        return query1.concat(query2);
    },

    /**
     * 브레이킹 뉴스 등록
     * @returns {string}
     */
    postInsertBreaknews : function() {
        var query1 = "INSERT INTO T_POSTLIST (POST_TYPE, CATEGORY, POST_TITLE, POST_BODY, PROFILE_IMAGE, MAIN_IMAGE, TAG, TIMER, ACTIVE_YN, SOURCE_ORIGIN) ";
        var query2 = " VALUES ('1101', ?, ?, ?, ?, ?, '', NOW(), 'Y', ?)";
        return query1.concat(query2);
    }

};

// 모듈 익스포트
module.exports = query;
