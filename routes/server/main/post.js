/**
 * Created by kim on 2016-11-03.
 */

// 쿼리 모델정의
let postModel = require('../../../config/models/postModel');

// 공통 유틸모듈 로드
let utils = require('../../../config/commons/utils');

let path = require('path');

module.exports = function(app, db)
{

    /**
     *  @desc 포스트 글 상세페이지 API
     *  @param String id : 페이지 번호
     *  @return one Post
     */
    app.get('/api/v0.1/getPostView/:id', function(req, res) {
        // 빈값이 아닐때
        if(!utils.isEmpty(req.params.id)) {
            // 상세페이지 글 1건을 조회한다.
            db.query(postModel.postFindOne(), [req.params.id], function(err, rows) {
                if (err) throw err;
                if(rows[0] != undefined) {
                    let obj = {};
                    db.query(postModel.postFindCount(), function(err1, rows1) {
                        if (err1) throw err1;
                        let offset = Math.floor((Math.random() * rows1[0].TOTAL_COUNT) / 2);
                        db.query(postModel.randomPostList(), [offset], function(err2, rows2) {
                            if (err1) throw err1;
                            let post = [];
                            for(let i = 0; i < rows2.length; i++)
                                post.push(rows2[i]);
                            obj.postContents = rows[0];
                            obj.postRandom = post;
                            res.json(obj);
                        });
                    });
                } else {
                    res.json({code: 1})
                }
            });
        } else {
            res.json({Message : '[[ "id" ]] There is no parameter.'})
        }
    });

    /**
     *  @desc 포스트 글 상세페이지 API
     *  @param String id : 페이지 번호
     *  @return one Post
     */
    app.get('/api/v0.1/getBreakNewView/:id', function(req, res) {
        // 빈값이 아닐때
        if(!utils.isEmpty(req.params.id)) {
            // 상세페이지 글 1건을 조회한다.
            db.query(postModel.postFindOne(), [req.params.id], function(err, rows) {
                if (err) throw err;
                let obj = {};
                db.query(postModel.postFindCount(), function(err1, rows1) {
                    if (err1) throw err1;
                    let offset = Math.floor((Math.random() * rows1[0].TOTAL_COUNT) / 2);
                    db.query(postModel.randomPostList(), [offset], function(err2, rows2) {
                        if (err1) throw err1;
                        let post = [];
                        for(let i = 0; i < rows2.length; i++)
                            post.push(rows2[i]);
                        obj.postContents = rows[0];
                        obj.postRandom = post;
                        res.json(obj);
                    });
                });
            });
        } else {
            res.json({Message : '[[ "id" ]] There is no parameter.'})
        }
    });

};