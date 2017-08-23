var fs_extra = require('fs.extra');
var fs = require('fs');
var util = require('util');
var formidable = require('formidable');
var log4js = require('log4js');
var userHome = require('user-home');
var logger = log4js.getLogger();
var path = require('path');
var archiver = require('archiver');
var mime = require('mime');
var appRoot = require('app-root-path');
var shell = require('shelljs');

module.exports = function (app, db) {

    logger.level = 'debug';

    // 회원가입 이메일 체크 및 등록
    app.get('/api/v0.1/userSignupCheck', function (req, res) {
        // 사용자 이메일
        var user_email = req.query.userEmail;

        // 등록된 이메일인지 체크한다.
        db.query('SELECT COUNT(*) AS RESULT_COUNT FROM T_GOOGLE_APP_USER WHERE USER_EMAIL = ?', user_email, function (err, rows) {
            var count = rows[0].RESULT_COUNT;
            if (count > 0) {
                // 있음
                res.json({resultCode: count, resultMsg: '등록 된 이메일 입니다.'})
            } else {
                // 없음
                // res.json({ resultCode : count, session : user_email })
                db.query('INSERT INTO T_GOOGLE_APP_USER (USER_EMAIL, CHAR_CODE, CHAR_YN, REG_DT) VALUES (?, ?, ?, now())', [user_email, '', 'N'], function (err, results) {
                    if (err) throw err;
                    if (results.insertId > 0) {
                        logger.debug(user_email + " 님이 등록되었습니다.");
                        res.json({resultCode: 2, resultMsg: '등록 되었습니다.'});
                    }
                });
            }
        })
    });

    // 로그인 체크
    app.get('/api/v0.1/userLoginCheck', function (req, res) {
        // 사용자 이메일
        var user_email = req.query.userEmail;

        // 등록된 이메일인지 체크한다.
        db.query('SELECT COUNT(*) AS RESULT_COUNT FROM T_GOOGLE_APP_USER WHERE USER_EMAIL = ?', user_email, function (err, rows) {
            var count = rows[0].RESULT_COUNT;
            if (count > 0) {
                logger.debug(user_email + ' -> 로그인 성공!')
                db.query('SELECT CHAR_CODE, CHAR_YN, DATE_FORMAT(CHAR_DT, "%Y-%m-%d %h:%i:%s") AS CHAR_DT  FROM T_GOOGLE_APP_USER WHERE USER_EMAIL = ?', user_email, function (err, data) {
                    logger.debug(data);

                    var char_yn = data[0].CHAR_YN;
                    var char_dt = data[0].CHAR_DT;
                    var char_code = data[0].CHAR_CODE;

                    // 이메일이 존재하므로, 로그인처리
                    res.json({
                        resultCode: count,
                        session: user_email,
                        char_code: char_code,
                        char_yn: char_yn,
                        char_dt: char_dt
                    })
                });
            } else {
                // 이메일이 없으므로 리턴
                logger.debug(user_email + ' -> 로그인 실패!')
                res.json({resultCode: count, resultMsg: '등록된 아이디가 없습니다.'})
            }
        })
    });

    // 사용자 정보를 가져온다.
    app.get('/api/v0.1/getUser', function (req, res) {
        var user_email = req.query.userEmail;
        db.query('SELECT USER_EMAIL, CHAR_CODE, CHAR_YN, DATE_FORMAT(CHAR_DT, "%Y-%m-%d %h:%i:%s") AS CHAR_DT FROM T_GOOGLE_APP_USER WHERE USER_EMAIL = ?', user_email, function (err, data) {
            logger.debug('로그인 사용자정보 -> ' + user_email);

            var char_yn = data[0].CHAR_YN;
            var char_dt = data[0].CHAR_DT;
            var char_code = data[0].CHAR_CODE;
            var email = data[0].USER_EMAIL;

            // 사용자 정보
            res.json({resultCode: 1, user_email: email, char_code: char_code, char_yn: char_yn, char_dt: char_dt})
        });
    });

    // 파판14 UI데이터 임시 업로드
    app.post('/api/v0.1/hudLayoutUpload', function (req, res) {

        // 캐릭터 코드
        var charDir = req.query.code;

        // 유저 이메일
        var user_email = req.query.email;

        // 폼 데이타
        var form = new formidable.IncomingForm();
        form.multiples = true;

        form.parse(req, function (err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });

        form.on('end', function (fields, files) {
            logger.debug("총 업로드 파일 갯수 == ", this.openedFiles.length);

            // 업로드 파일리스트
            var files = this.openedFiles;

            // 서버 업로드 기본경로
            //var new_location = 'd:\\upload/';
            var new_location = '/usr/local/upload/';
            var r = 0;

            // 이곳에서 먼저 사용자별 캐릭터 식별코드를 디비조회한다.
            db.query("SELECT CHAR_YN FROM T_GOOGLE_APP_USER WHERE USER_EMAIL = ?", user_email, function (err, rows) {
                if (err) throw err;
                // 업로드를 사용하지 않고 있다면,
                if (rows[0].CHAR_YN == 'N') {
                    try {
                        // 새경로에 파판 캐릭터 식별코드 이름으로 폴더를 동기화 생성한다.
                        fs_extra.mkdirpSync(new_location + charDir);
                        logger.debug('폴더명: ' + charDir + ' -> 생성완료');
                    } catch (e) {
                        throw e;
                    }

                    for (var i = 0; i < files.length; i++) {
                        // 임시 업로드경로
                        var temp_path = files[i].path;
                        // 코드명+파일명
                        var file_name = files[i].name;

                        // temp_path 로 받은 파일을, 원래 이름으로 변경하여 이동시킨다.
                        fs_extra.move(temp_path, new_location + charDir + "/" + file_name, function (err) {
                            if (err) {
                                console.error(err);
                            }
                        });
                        if (i == files.length - 1) {
                            r = 1;
                        }
                    } // END for

                    if (r > 0) {
                        // 업로드 완료시 디비내 개인 데이터의 캐릭터 코드값과 사용여부를 업데이트한다.
                        db.query("UPDATE T_GOOGLE_APP_USER SET CHAR_CODE = ?, CHAR_YN = 'Y', CHAR_DT = NOW() WHERE USER_EMAIL = ?", [charDir, user_email], function (err, rows) {
                            if (err) throw err;
                            logger.debug('캐릭터 코드: ' + charDir + ' -> 사용등록 완료');

                            fs.readdir(new_location + charDir + '/', function (err, data) {
                                var zipName = new_location + charDir + '/' + charDir + ".zip",
                                    fileArray = getDirectoryList(new_location + charDir + '/'),
                                    output = fs.createWriteStream(zipName),
                                    archive = archiver('zip');

                                // 데이터를 파이프로 내보냄
                                archive.pipe(output);

                                // 파일의 갯수만큼 아카이브에 추가
                                fileArray.forEach(function (item) {
                                    var file = item.path + item.name;
                                    archive.append(fs.createReadStream(file), {name: item.name});
                                });

                                // stream final
                                archive.finalize();

                                // 압축이 완료되었다면,
                                output.on('close', function () {
                                    // 폴더 하위에 업로드 파일을 모두 삭제한다.
                                    rmDir(fileArray);

                                    // 파일목록을 다시 가져온다.
                                    var zipFile = getDirectoryList(new_location + charDir + '/');
                                    if (zipFile.length == 1) {

                                        // 실제 업로드 경로에서 프로젝트 경로로 복사한다.
                                        shell.cp('-R', new_location + charDir + '/', appRoot+'/routes/upload');
                                        logger.debug(new_location + charDir + " -> " + appRoot + '/routes/upload' + " 복사 완료!\n");
                                        logger.debug(zipFile[0].path + zipFile[0].name + " 업로드 완료!\n");
                                    }
                                });
                            });
                        });
                    }
                } else {
                    // 업로드상태값이 사용중이라면, 재업로드 하는것이므로 서버업로드 기본경로내에 캐릭터코드와 일치하는 폴더를 찾아서,
                    // 해당 폴더내 하위폴더에 기존 파일을 삭제하고, 새로 업로드 한다.
                    logger.debug('재 업로드 입니다.');
                }

            });

        });

        return;
    });

    /**
     * Returns array of file names from specified directory
     *
     * @param {dir} directory of source files.
     * return {array}
     */
    var getDirectoryList = function (dir) {
        var fileArray = [],
            files = fs.readdirSync(dir);
        files.forEach(function (file) {
            var obj = {name: file, path: dir};
            fileArray.push(obj);
        });
        return fileArray;
    };

    /**
     * 파일 및 폴더삭제
     * @param dirPath
     */
    var rmDir = function (files) {
        files.forEach(function (file) {
            fs.unlinkSync(file.path + file.name);
        });
    };

    var deleteFolderRecursive = function(dirPath) {
        try { var files = fs.readdirSync(dirPath);}
        catch(e) { return; }
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    deleteFolderRecursive(filePath);
            }
        }
        // fs.rmdirSync(dirPath);
    };

    // UI 백업
    app.post('/api/v0.1/putHudBackup', function (req, res) {
        // 캐릭터 코드
        var charDir = req.query.code;

        // 유저 이메일
        var user_email = req.query.email;

        // 폼 데이타
        var form = new formidable.IncomingForm();
        form.multiples = true;

        form.parse(req, function (err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });

        form.on('end', function (fields, files) {
            logger.debug("총 업로드 파일 갯수 == ", this.openedFiles.length);

            // 업로드 파일리스트
            var files = this.openedFiles;

            // 서버 업로드 기본경로
            // 백업을 사용한다는것은 1번이라도 업로드를 했으므로, 해당 캐릭터코드 디렉토리까지 경로를 잡는다.
            //var new_location = 'd:\\upload/' + charDir + '/';
            var new_location = '/usr/local/upload/' + charDir + '/';

            var r = 0;
            
            // 저장되어있는 압축파일 삭제
            deleteFolderRecursive(new_location)
            logger.debug('저장된 압축파일이 삭제되었습니다.');

            for (var i = 0; i < files.length; i++) {
                // 임시 업로드경로
                var temp_path = files[i].path;
                // 코드명+파일명
                var file_name = files[i].name;

                // temp_path 로 받은 파일을, 원래 이름으로 변경하여 해당 경로로 이동시킨다.
                fs_extra.move(temp_path, new_location + file_name, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
                if(i == files.length - 1) {
                    r = 1;
                }
            } // end for

            if(r > 0) {

                // 업로드 완료시 디비내 개인 데이터의 캐릭터 코드값과 사용여부를 업데이트한다.
                db.query("UPDATE T_GOOGLE_APP_USER SET CHAR_DT = NOW() WHERE USER_EMAIL = ?", [user_email], function (err, rows) {
                    if (err) throw err;
                    logger.debug('캐릭터 코드: ' + charDir + ' -> 백업 완료');

                    // 캐릭터디렉토리를 읽어들인다.
                    fs.readdir(new_location, function (err, data) {
                        var zipName = new_location + charDir + ".zip",
                            fileArray = getDirectoryList(new_location),
                            output = fs.createWriteStream(zipName),
                            archive = archiver('zip');

                        // 데이터를 파이프로 내보냄
                        archive.pipe(output);

                        // 파일의 갯수만큼 아카이브에 추가
                        fileArray.forEach(function (item) {
                            var file = item.path + item.name;
                            archive.append(fs.createReadStream(file), {name: item.name});
                        });

                        // stream final
                        archive.finalize();

                        // 압축이 완료되었다면,
                        output.on('close', function () {
                            // 폴더 하위에 업로드 파일을 모두 삭제한다.
                            rmDir(fileArray);

                            // 파일목록을 다시 가져온다.
                            var zipFile = getDirectoryList(new_location);
                            if (zipFile.length == 1) {

                                // 실제 업로드 경로에서 프로젝트 경로로 복사한다.
                                shell.cp('-R', new_location, appRoot+'/routes/upload');
                                logger.debug(new_location +" -> " + appRoot + '/routes/upload' + " 복사 완료!\n");

                                logger.debug(zipFile[0].path + zipFile[0].name + " 백업 완료!\n");
                            }
                        });
                    });
                });
            }
        });
        return;
    });

    app.get('/api/v0.1/getDownload', function(req, res) {

        var charDir = req.query.charCode;
        var downloadPath = req.query.downloadPath;
        var fileName = charDir + '.zip';

        logger.debug('파일명 -> ' + fileName);
        logger.debug('다운로드 경로 -> ' + downloadPath);
        
        // 업로드 기본경로
         var uploadPath = '/usr/local/upload/';
        //var uploadPath = 'd:\\upload/';
        var uploadFilePath = uploadPath + charDir + '/' + fileName;

        // 업로드 경로에 개인 캐릭터코드 디렉토리 하위에 파일을 읽어온다.
        var files = fs.readdirSync(uploadPath + charDir);
        for (var i = 0; i < files.length; i++) {
            var input = fs.createReadStream(uploadPath + charDir + '/' + files[i]);
            console.log(downloadPath + '\\' + files[i]);
            var output = fs.createWriteStream(downloadPath + '\\' + files[i]);
            input.pipe(output);
        }

    });

    // UI 적용
    app.get('/ui_accept', function (req, res) {

        //var userName = process.env['USER'].split(path.sep)[2];
        //var loginId = path.join("domainName",userName);
        // console.log(loginId);

        // UI가 적용될 파판 UI경로
        var system_path = userHome + '/Documents/My Games/FINAL FANTASY XIV - A Realm Reborn/';
        logger.debug(system_path);

        // 캐릭터 코드
        var charDir = 'FFXIV_CHR004000000231CE3B';

        // 서버 업로드 경로
        //var uploadPath = 'd:\\upload/';
        var uploadPath = '/usr/local/upload/';

        // UI경로에 캐릭터 코드로 된 폴더가 없으면 새로 생성한다.
        if (!fs.existsSync(system_path + charDir)) {
            fs.mkdirSync(system_path + charDir);
            logger.debug(charDir + " -> 폴더를 생성하였습니다.");
        }

        // 업로드 경로에 개인 캐릭터코드 디렉토리 하위에 파일을 읽어온다.
        var files = fs.readdirSync(uploadPath + charDir);
        for (var i = 0; i < files.length; i++) {
            var input = fs.createReadStream(uploadPath + charDir + '/' + files[i]);
            var output = fs.createWriteStream(system_path + charDir + '/' + files[i]);
            input.pipe(output);
            if (i == files.length - 1) {
                var fileCount = fs.readdirSync(system_path + charDir);
                if (fileCount.length > 0) {
                    logger.debug('UI 적용이 완료 되었습니다.');
                    res.json({result: '1'});
                }
            }
        }
    });
};