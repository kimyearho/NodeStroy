// 쿼리 모델정의
let postModel = require('../../../config/models/postModel')

// 공통 유틸모듈 로드
let utils = require('../../../config/commons/utils')

let fs_extra = require('fs.extra');
let fs = require('fs');
let util = require('util');
let formidable = require('formidable');
let log4js = require('log4js');
let userHome = require('user-home');
let logger = log4js.getLogger();

let path = require('path');


module.exports = function (app, db) {

    logger.level = 'debug';

    // default limit
    let limit_count = 0;

    // 웹다매 앱 버전 체크 (임시)
    app.post('/api/v0.1/appVersionCheck', function (req, res) {
        let apikey = req.body.apiKey;
        db.query("SELECT COUNT(*) AS count, VERSION as version FROM T_APP_VERSION WHERE APIKEY = ?", apikey, function (err, rows) {
            if (err) throw err;
            res.json(rows[0]);
        });
    });

    /**
     * @desc 메인 인기글 목록 API
     * @return POP LIST
     */
    app.get('/api/v0.1/getPopularList', function (req, res) {
        db.query(postModel.postPopularList(), function (err, rows) {
            if (err) throw err;
            res.json(rows);
        });
    });

    /**
     *  @desc 메인 포스트 글 목록 API
     *  @return POST List
     */
    app.get('/api/v0.1/getPostList', function (req, res) {
        limit_count = 6;
        let response = new Object();
        db.query(postModel.postList(), [limit_count], function (err, post) {
            if (err) throw err;
            db.query(postModel.breakNewsList(), function (err, news) {
                if (err) throw err;
                response.postList = post;
                response.news = news;

                res.json(response);
            });
        });
    });

    /**
     *  @desc 메인 BreakNews API
     *  @return POST List
     */
    app.get('/api/v0.1/getBreakNews', function (req, res) {
        db.query(postModel.breakNewsList(), function (err, rows) {
            if (err) throw err;
            res.json(rows);
        });
    });

    /**
     *  @desc IT 포스트 글 목록 API (기본 조회)
     *  @return POST List
     */
    app.get('/api/v0.1/getPostItList', function (req, res) {
        limit_count = 10;
        let offset = 0;
        db.query(postModel.postListIT(), [offset, limit_count], function (err, rows) {
            if (err) throw err;
            db.query('SELECT COUNT(*) AS COUNT FROM T_POSTLIST WHERE ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2101"', function (err, rows2) {
                let post = new Object();
                post.rows = rows;
                post.totalCount = rows2;
                res.json(post);
            });
        });
    });

    /**
     *  @desc IT 포스트 글 목록 API (페이지 번호로 조회)
     *  @return POST List
     */
    app.get('/api/v0.1/getPostItList/:page', function (req, res) {
        limit_count = 10;
        let offset = 0;
        if (req.params.page != undefined) {
            if (Number(req.params.page) <= 1) {
                offset = 0;
            } else {
                offset = Number(req.params.page) * limit_count - 10;
            }
        }
        db.query(postModel.postListIT(), [offset, limit_count], function (err, rows) {
            if (err) throw err;
            db.query('SELECT COUNT(*) AS COUNT FROM T_POSTLIST WHERE ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2101"', function (err, rows2) {
                let post = new Object();
                post.rows = rows;
                post.totalCount = rows2;
                res.json(post);
            });
        });
    });

    /**
     *  @desc GAME 포스트 글 목록 API (기본 조회)
     *  @return POST List
     */
    app.get('/api/v0.1/getPostGamesList', function (req, res) {
        limit_count = 10;
        let offset = 0;
        db.query(postModel.postListGames(), [offset, limit_count], function (err, rows) {
            if (err) throw err;
            db.query('SELECT COUNT(*) AS COUNT FROM T_POSTLIST WHERE ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2102"', function (err, rows2) {
                let post = new Object();
                post.rows = rows;
                post.totalCount = rows2;
                res.json(post);
            });
        });
    });

    /**
     *  @desc GAME 포스트 글 목록 API (페이지 번호로 조회)
     *  @return POST List
     */
    app.get('/api/v0.1/getPostGamesList/:page', function (req, res) {
        limit_count = 10;
        let offset = 0;
        if (req.params.page != undefined) {
            if (Number(req.params.page) <= 1) {
                offset = 0;
            } else {
                offset = Number(req.params.page) * limit_count - 10;
            }
        }
        db.query(postModel.postListGames(), [offset, limit_count], function (err, rows) {
            if (err) throw err;
            db.query('SELECT COUNT(*) AS COUNT FROM T_POSTLIST WHERE ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2102"', function (err, rows2) {
                let post = new Object();
                post.rows = rows;
                post.totalCount = rows2;
                res.json(post);
            });
        });
    });

    /**
     *  @desc 메인 포스트 글 더보기 API
     *  @param String page : 페이지 번호
     *  @return POST List
     */
    app.get('/api/v0.1/getPostList/:page', function (req, res) {
        // 더 보기 카운트
        let next_count = Number(req.params.page);
        let limit = 5;

        db.query(postModel.loadMorePostList(), [next_count, limit], function (err, rows) {
            if (err) throw err;
            db.query('SELECT COUNT(*) AS TOTAL FROM T_POSTLIST WHERE 1=1 AND ACTIVE_YN = "Y" AND POST_TYPE = "1100"', function (err, count) {
                if (err) throw err;
                let post = new Object();

                // 최초 더보기 하기전에 이미 5개의 목록이 보여지므로 카운트를 맞춰준다.
                let next = next_count + 5;
                if (count[0].TOTAL <= next) {
                    // 총 갯수가 다음 갯수와 동일하거나 작으면,
                    post.pageEnd = 'Y';
                }
                post.rows = rows;
                res.json(post);
            });
        });
    });

    /**
     *  @desc 네비메뉴 브레이크 뉴스 목록
     *  @return comment list
     */
    app.get('/api/v0.1/topBreaknewsList', function (req, res) {
        db.query(postModel.postTopBreaknewsList(), function (err, rows) {
            if (err) throw err;
            res.json(rows);
        });
    });

    /**
     *  @desc 포스트 코멘트 등록 API
     *  @param RequestBody
     *  @return 성공 1 / 실패 0
     */
    app.post('/api/v0.1/insertComment', function (req, res) {
        db.query(postModel.postInsetComment(), [req.body.post_seq, req.body.comment_who, req.body.comment_email,
            req.body.comment_content, 'images/face-empty.png'], function (err, rows) {
            if (err) throw err;
            let obj = new Object();
            obj.post_seq = req.body.post_seq;
            obj.insertId = rows.insertId;
            res.json(obj);
        });
    });

    /**
     * @desc 나의 이야기 목록 API
     * @return MY LIST
     */
    app.get('/api/v0.1/getMyStoryList', function (req, res) {
        limit_count = 10;
        let offset = 0;
        db.query(postModel.postMyStoryList(), [offset, limit_count], function (err, rows) {
            if (err) throw err;
            db.query('SELECT COUNT(*) AS COUNT FROM T_POSTLIST WHERE ACTIVE_YN = "Y" AND POST_TYPE = "1100" AND CATEGORY = "2104"', function (err, rows2) {
                let post = new Object();
                post.rows = rows;
                post.totalCount = rows2;
                res.json(post);
            });
        });
    });

    /**
     *  @desc 포스트 글 등록 API
     *  @param RequestBody
     *  @return 성공 1 / 실패 0
     */
    app.post('/api/v0.1/insertPost', function (req, res) {

        let html = removeHtml(req.body.postContents);
        let nonBody = html.substring(0, 130);

        let array_params = [
            req.body.postMark,
            req.body.postSubject,
            req.body.postContents,
            nonBody,
            'images/profile/profile.gif',
            req.body.postCoverImage,
            req.body.origin_url,
        ]

        db.getConnection(function (err, conn) {
            conn.beginTransaction(function (err) {
                conn.query(postModel.postInsertPost(), array_params, function (err, rows) {
                    if (err) {
                        console.error(err);
                        conn.rollback(function () {
                            console.error('rollback error');
                            throw err;
                        });
                        res.json({result: 0})
                        return;
                    }
                    conn.commit(function (err) {
                        if (err) {
                            console.error(err);
                            conn.rollback(function () {
                                console.error('rollback error');
                                throw err;
                            });
                        }// if err
                    });// commit
                    res.json({result: 1})
                });
            });
        });
    });

    /**
     *  @desc BreakNews POST 등록 API
     *  @param RequestBody
     *  @return 성공 1 / 실패 0
     */
    app.post('/api/v0.1/insertBreakNews', function (req, res) {
        let array_params = [
            req.body.postMark,
            req.body.postSubject,
            req.body.postContents,
            'images/profile/profile.gif',
            req.body.postCoverImage,
            req.body.origin_url
        ]
        db.getConnection(function (err, conn) {
            conn.beginTransaction(function (err) {
                conn.query(postModel.postInsertBreaknews(), array_params, function (err, rows) {
                    if (err) {
                        console.error(err);
                        conn.rollback(function () {
                            console.error('rollback error');
                            throw err;
                        });
                        res.json({result: 0})
                        return;
                    }
                    conn.commit(function (err) {
                        if (err) {
                            console.error(err);
                            conn.rollback(function () {
                                console.error('rollback error');
                                throw err;
                            });
                        }// if err
                    });// commit
                    res.json({result: 1})
                });
            });
        });
    });
}

let removeHtml = function(str) {
    str = str.replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/g,"");
    str = str.replace(/&nbsp;/gi,'');
    return str;
}

/**
 * 파일 및 폴더삭제
 * @param dirPath
 */
let rmDir = function (dirPath) {
    try {
        let files = fs.readdirSync(dirPath);
    }
    catch (e) {
        return;
    }
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            let filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    }
    fs.rmdirSync(dirPath);
};