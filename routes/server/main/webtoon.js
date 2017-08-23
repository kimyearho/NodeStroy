const contents = require('../../../config/commons/constans')
const request = require('request');
const cheerio = require('cheerio');
const path = require('path');

module.exports = function(app, db, pool)
{

    /**
     * 선택한 웹툰 별 목록 API
     */
    app.post('/api/v0.1/getWebtoonList', function(req, res) {

        // 웹툰 아이디
        let webtoon_id = req.body.webtoon_id;

        // 지정한 웹툰 갯수 조회
        db.query('SELECT COUNT(*) AS COUNT FROM T_POSTWEBTOON WHERE 1=1 AND WEBTOON_ID = ?', [webtoon_id], function(err, rows) {
            if(rows[0].COUNT == 0) {

                // 웹툰 페이지 URL
                let url = "http://comic.naver.com/webtoon/list.nhn?titleId=" + webtoon_id

                request(url, function(error, response, html) {
                    if (error) { throw error };

                    let $ = cheerio.load(html);
                    let real_num ;

                    // 반복문을 통해 최근편의 주소를 가져온다
                    // 광고가 있으므로 반복문 사용
                    for(let i = 0; i < 4; i++) {
                        let src = $('.viewList').find('a')[i].attribs;
                        if(src != '#') {
                            real_num = src;
                        }
                    }

                    // 파싱을 통해 최근편수를 가져온다.
                    let total_episode = real_num.href.substring(38, real_num.href.lastIndexOf('&'));

                    // 최근편수
                    let episode = Number(total_episode)

                    // 웹툰 전체 페이지 갯수를 조회한다.
                    let pageNum = parseWebtoonPageNumber(episode);

                    for(let i = 1; i <= pageNum; i++) {

                        // 페이지 별 조회를 위함.
                        url = "http://comic.naver.com/webtoon/list.nhn?titleId=" + webtoon_id + "&page=" + i
                        request(url, function(error, response, html) {

                            // html을 긁어온다
                            $ = cheerio.load(html);

                            // 아래위치를 파싱한다
                            $('.viewList').find('a').each(function(i, tr) {
                                let children = $(this).children();
                                if(children[0] != undefined) {
                                    if(children[0].parent.attribs.href != '#') {
                                        // 웹툰 각 편별 제목
                                        let title = children[0].attribs.title;

                                        // 링크 URL
                                        let href = children[0].parent.attribs.href;

                                        // 링크 URL 을 파싱하여 실제 편수를 추출
                                        let real_num = href.substring(href.indexOf('&') + 1, href.lastIndexOf('&')).split('=');

                                        // 최근 편수들 삽입쿼리
                                        let insertQuery = 'INSERT INTO T_POSTWEBTOON(WEBTOON_ID,REAL_PAGENUM,WEBTOON_TITLE,WRT_DTM )'
                                            + ' VALUES(?, ?, ?, NOW())';

                                        // 트랜잭션 처리 중 오류가 발생하는데, 확인해봐야함.
                                        pool.getConnection(function(err, connection) {
                                            connection.query(insertQuery, [webtoon_id, real_num[1], title], function(err, rows) {
                                                if(err) throw err;
                                            })
                                            connection.release();
                                        });
                                    }
                                }
                            });
                        }); // end request
                    } // end for
                });

            } else {
                // 지정한 웹툰이 등록 되어 있을 경우,
                let selectQuery = 'SELECT * FROM T_POSTWEBTOON WHERE 1=1 AND WEBTOON_ID = ? ORDER BY REAL_PAGENUM+1 ASC';
                db.query(selectQuery, [webtoon_id], function(err, rows) {
                    if(err) throw err;
                    res.json(rows);
                });

            }
        });

    }); // api end

    // 편수에 따른 웹툰제목 목록
    function selectQuery() {
        return 'SELECT WEBTOON_TITLE FROM T_POSTWEBTOON WHERE WEBTOON_ID = ? AND REAL_PAGENUM IN (?) ORDER BY REAL_PAGENUM+1 DESC';
    }

    /**
     * 웹툰 전체 페이지 갯수를 조회한다.
     * @param episode
     * @returns {Number}
     */
    function parseWebtoonPageNumber(episode) {

        let pageNum = "";
        let pageCount = 10;

        if( (episode % pageCount) == 0 ) {
            // 정수형이라면 페이지 갯수가 1페이지 10개씩 딱 떨어진다는 의미
            pageNum = episode / pageCount;
        } else {
            /**
             * <pre>
             *   페이지 갯수가 소수점으로 나뉠경우는 1페이지당 10개의 목록을 초과한셈이므로
             *   정수형으로 변경하여 소수점을 버린뒤 1페이지를 더해준다
             *   ex:) 39.4 -> 39페이지가 아닌 40페이지의 4개의 목록이 있는셈.
             * </pre>
             */
            pageNum = (episode / pageCount) + 1
        }

        return parseInt(pageNum);

    }

}