var request = require('request');
var cheerio = require('cheerio');
var CronJob = require('cron').CronJob;

module.exports = function(pool) {

    // 0: 일요일
    // 6: 토요일
    // 0-6: 1주일
    // 웹툰의 업데이트 주기는 전날 23시 30분이다.
    // 예를들어 노블레스 경우 화요일 웹툰이지만, 업로드 시각은 전날인 월요일 23시 30분.
    // 그러므로 크론의 시각을 전날로 지정한다.

    // 매주 월요일 23시 55분 00초에 시작
    var job = new CronJob({
        cronTime: '00 55 23 * * 1',
        onTick: function() {
            
            // 웹툰정보
            const webtoon_id = '25455',
                   webtoon_nm = '노블레스';
            
            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);
        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 화요일 23시 55분 00초에 시작
    var job = new CronJob({
        cronTime: '00 55 23 * * 2',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '626907',
                webtoon_nm = '복학왕';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);

        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 화요일 23시 57분 00초에 시작
    var job = new CronJob({
        cronTime: '00 57 23 * * 2',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '662774',
                webtoon_nm = '고수';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);

        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 화요일 23시 59분 00초에 시작
    var job = new CronJob({
        cronTime: '00 59 23 * * 2',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '642598',
                webtoon_nm = '조선왕족실톡';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);

        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 수요일 23시 55분 00초에 시작
    var job = new CronJob({
        cronTime: '00 55 23 * * 3',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '679519',
                webtoon_nm = '대학일기';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);
        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 목요일 23시 55분 00초에 시작
    var job = new CronJob({
        cronTime: '00 55 23 * * 4',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '318995',
                webtoon_nm = '갓 오브 하이스쿨';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);

        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 토요일 23시 55분 00초에 시작
    var job = new CronJob({
        cronTime: '00 55 23 * * 6',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '642598',
                webtoon_nm = '조선왕족실톡';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);

        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 토요일 23시 57분 00초에 시작
    var job = new CronJob({
        cronTime: '00 57 23 * * 6',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '374974',
                webtoon_nm = '심심한 마왕';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);

        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 일요일 23시 55분 00초에 시작
    var job = new CronJob({
        cronTime: '00 55 23 * * 0',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '679519',
                webtoon_nm = '대학일기';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);
        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

    // 매주 일요일 23시 57분 00초에 시작
    var job = new CronJob({
        cronTime: '00 57 23 * * 0',
        onTick: function() {

            // 웹툰정보
            const webtoon_id = '602910',
                webtoon_nm = '윈드브레이커';

            // 스케쥴러 시작
            newWebtoonJob(webtoon_id, webtoon_nm, pool);
        },
        start: false,
        timeZone: 'Asia/Seoul'
    });
    job.start();

}

/**
 * 매주 최신편의 웹툰을 가져올 함수
 * 
 * @param webtoon_id - 웹툰 아이디
 * @param webtoon_nm - 웹툰명
 */
function newWebtoonJob(webtoon_id, webtoon_nm, pool) {

    // 페이지 별 조회를 위함.
    var url = "http://comic.naver.com/webtoon/list.nhn?titleId=" + webtoon_id
    request(url, function(error, response, html) {

        // html을 긁어온다
        $ = cheerio.load(html);

        // 아래위치를 파싱한다
        $('.viewList').find('a').each(function(i, tr) {
            var children = $(this).children();
            if(children[0] != undefined) {
                if(children[0].parent.attribs.href != '#') {

                    // 웹툰 각 편별 제목
                    var title = children[0].attribs.title;

                    // 링크 URL
                    var href = children[0].parent.attribs.href;

                    // 링크 URL 을 파싱하여 실제 편수를 추출
                    var real_num = href.substring(href.indexOf('&') + 1, href.lastIndexOf('&')).split('=');

                    // 최근 편수들 삽입쿼리
                    var insertQuery = 'INSERT INTO T_POSTWEBTOON(WEBTOON_ID,REAL_PAGENUM,WEBTOON_TITLE,WRT_DTM )'
                        + ' VALUES(?, ?, ?, NOW())';

                    // 트랜잭션 처리 중 오류가 발생하는데, 확인해봐야함.
                    pool.getConnection(function(err, connection) {
                        connection.query(insertQuery, [webtoon_id, real_num[1], title], function(err, rows) {
                            if(err) throw err;
                            console.log('');
                            console.log('=================== [[ JobScheduler ]] ===================');
                            console.log('  '+webtoon_nm+' : ' + title + '편이 신규로 추가 되었습니다.');
                            console.log('==========================================================');
                            console.log('');
                        });
                        connection.release();
                    });

                    return false;
                }
            }
        });
    }); // end request

}
