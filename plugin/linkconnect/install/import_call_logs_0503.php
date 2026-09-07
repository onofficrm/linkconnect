<?php
/**
 * 일회 임포트 엔드포인트 제거됨.
 */
header('Content-Type: application/json; charset=utf-8');
http_response_code(410);
echo json_encode(array(
    'ok' => false,
    'error' => '이 임포트 엔드포인트는 제거되었습니다. 관리자 콜디비 화면에서 붙여넣기/업로드를 사용하세요.',
    'code' => 'GONE',
), JSON_UNESCAPED_UNICODE);
