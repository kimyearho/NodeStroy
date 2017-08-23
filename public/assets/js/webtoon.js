 var apihost = 'http://nodestory.com:8080';

// 웹툰 라디오버튼 클릭이벤트
$('.webtoon_box').on('click', function() {
    if ( $(this).is(':checked') ) {
        var webtoon_id = $(this).val();
        $('#webtoonID').val(webtoon_id);

        var webtoon_nm = $(this).attr('title');
        $('#webtoonNM').val(webtoon_nm);

        // 에피소드 선택
        $.ajax({ url : 'http://150.95.137.151:8001/api/v0.1/getWebtoonList', type : 'post',
            data : { webtoon_id : webtoon_id },
            dataType : 'json',
            success : function(json) {
                $('#selectBox option').not("[value='']").remove();
                for(var i=0; i < json.length; i++) {
                    // 제목이 휴재가 아닌것만 표시한다.
                    if(!json[i].WEBTOON_TITLE.match('.*휴재.*')) {
                        if(i == json.length - 1) {
                            $('#selectBox').prepend( '<option selected="selected" value="'+ json[i].REAL_PAGENUM +'">'
                                + json[i].WEBTOON_TITLE + '</option>' );
                        } else  {
                            $('#selectBox').prepend( '<option value="'+ json[i].REAL_PAGENUM +'">'
                                + json[i].WEBTOON_TITLE + '</option>' );
                        }
                    }
                }

                $('#selectBox option').prop('checked', false);
                $('#selectBox').multiselect({
                    buttonWidth: '200px',
                    includeSelectAllOption: true,
                    enableFiltering: true
                });
                $('#selectBox').multiselect('rebuild');
            },
            error : function() {}
        });
        $('#select_webtoon').val( $(this).attr('title') );
    }
});

// 웹툰 다운로드 이벤트
$('#down_btn').on('click', function() {
    $.fileDownload(apihost+'/api/v0.1/getWdmDownloads.do', {
        successCallback: function (url) {},
        failCallback: function (html, url) {}
    });
});

function webtoonDownloads(ep, times, webtoonID, dir_time, total_count, d_count) {
    var arr = [];

    for (var i = 0; i < times; i++) {
        // 배열의 갯수만큼 주소를 만들어 배열에 담는다.
        if (ep.length) {
            arr.push(ep.shift());
        } else {
            break;
        }
    }

    if (arr.length) {

        $('#group').slideDown('slow');
        $('#loading').html('진행율: ' + d_count + '/' + total_count)
        $.ajax({
            type : 'post',
            url : apihost+'/api/v0.1/getDownloadList.do',
            dataType : 'json',
            data : {
                webtoon_id : webtoonID,
                title: arr,
                dir_time : dir_time
            },
            success : function (json) {
                if(json.resultCode == '1') {
                    d_count++;
                    webtoonDownloads(ep, times, webtoonID, dir_time, total_count, d_count);
                } else {
                    $('#group').hide();
                    alert('다운로드가 실패되었습니다.\n다시 시도해주세요.');
                    return false;
                }
            },
            error : function(json) {
                $('.msg').text(json.errorMsg);
                setTimeout(function() {
                    $('#group').hide();
                },2000);
            }
        });

    } else {
        $('.group_msg').html('파일을 압축하는중 입니다...');
        $.ajax({
            type : 'get',
            url : apihost+'/api/v0.1/getWdmArchiveThread.do',
            data : { dir : dir_time },
            success : function(result) {
                if(result.resultCode == 1) {
                    $('#group').hide();

                    var download_url = apihost+'/api/v0.1/getWdmArchiveDownloads.do?fileName='+result.resultData.filename;
                    $.fileDownload(download_url, {
                        successCallback: function (url) {},
                        failCallback: function (html, url) {}
                    });

                    // 옵션 초기화
                    $('#select_webtoon').val('');
                    $('#selectBox').multiselect('destroy');
                    $('#selectBox option').not("[value='']").remove();
                    $(':input[type=radio]').prop('checked', false);
                    $('.group_msg').html('그룹 다운로드가 진행 중 입니다.<br/>그룹 다운로드는 1분 ~ 최대 5분이 소요될 수 있습니다.<br/>');
                }
            }
        })
    }
}
