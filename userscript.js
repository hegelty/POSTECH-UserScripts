// ==UserScript==
// @name         POSTECH Auto Login & PLMS Redirect
// @namespace    https://sso.postech.ac.kr
// @version      1.0
// @description  포스텍 통합 로그인 자동화 및 PLMS 로그인 페이지 리다이렉트
// @match        https://sso.postech.ac.kr/sso/usr/postech/login/view
// @match        https://plms.postech.ac.kr/login/index.php
// @grant        none
// @author		 hegelty
// @source		 https://github.com/hegelty/POSTECH-SSO-UserScript

// ==/UserScript==

(function() {
  'use strict';

  const url = window.location.href;

  // PLMS 로그인 페이지 접속 시 SSO 스핀업 페이지로 리다이렉트
  if (url === 'https://plms.postech.ac.kr/login/index.php') {
    window.location.replace('https://plms.postech.ac.kr/passni/sso/spLogin.php');
    return;
  }

  // SSO 페이지 자동 로그인
  if (url === 'https://sso.postech.ac.kr/sso/usr/postech/login/view') {
   window.addEventListener('load', () => {
  // 통합로그인 폼 이름으로 확인
  const loginForm = document.getElementsByName('loginForm')[0];
  if (loginForm) {
    console.log(loginForm);
    // 여기에 실제 아이디와 비밀번호를 입력하세요
    const USER_ID = '';
    const USER_PW = '';

    // 페이지의 입력 필드와 버튼 선택
    const idField = document.querySelector('#login_id');
    const pwField = document.querySelector('#login_pwd');

    if (idField && pwField) {
      idField.value = USER_ID;
      pwField.value = USER_PW;

	  loginProc();
    } else {
      console.warn('자동 로그인: 요소를 찾을 수 없습니다.', { idField, pwField });
    }
  }
});
  }
})();
