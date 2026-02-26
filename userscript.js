// ==UserScript==
// @name         POSTECH Auto Login & PLMS Redirect
// @namespace    https://sso.postech.ac.kr
// @version      2.1.0
// @description  포스텍 통합 로그인 자동화 및 PLMS 로그인 페이지 리다이렉트 (Prompt 안전 모드)
// @match        https://sso.postech.ac.kr/*
// @match        https://plms.postech.ac.kr/login/index.php
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @author       hegelty
// ==/UserScript==

(function() {
  'use strict';

  const url = window.location.href;

  // 1. PLMS 로그인 페이지 접속 시 SSO 스핀업 페이지로 리다이렉트
  if (url.startsWith('https://plms.postech.ac.kr/login/index.php')) {
    window.location.replace('https://plms.postech.ac.kr/passni/sso/spLogin.php');
    return;
  }

  // 2. 스크립트 메뉴에 '로그인 정보 초기화' 버튼 추가 (지원하는 클라이언트용)
  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('🔄 로그인 정보 초기화 (Reset Credentials)', () => {
      GM_setValue('postech_id', '');
      GM_setValue('postech_pw', '');
      alert('저장된 로그인 정보가 초기화되었습니다. 페이지를 새로고침하면 다시 입력할 수 있습니다.');
    });
  }

  // 3. SSO 도메인 자동 로그인 로직
  if (url.includes('sso.postech.ac.kr')) {
    window.addEventListener('load', () => {
      const idField = document.querySelector('#login_id');
      const pwField = document.querySelector('#login_pwd');

      if (idField && pwField) {
        const savedId = GM_getValue('postech_id', '');
        const savedPw = GM_getValue('postech_pw', '');

        if (savedId && savedPw) {
          // 저장된 정보가 있으면 폼에 채우고 자동 로그인
          idField.value = savedId;
          pwField.value = savedPw;
          
          executeLogin();
        } else {
          // 저장된 정보가 없으면 브라우저 기본 Prompt로 입력받기
          requestCredentialsViaPrompt(idField, pwField);
        }
      }
    });
  }

  // --- 로그인 실행 공통 함수 ---
  function executeLogin() {
    if (typeof loginProc === 'function') {
      loginProc(); // 페이지 내장 로그인 함수 호출
    } else {
      // 내장 함수가 없을 경우 폼 직접 제출
      const loginForm = document.getElementsByName('loginForm')[0];
      if (loginForm) loginForm.submit();
    }
  }

  // --- 프롬프트 UI 생성 함수 (가장 호환성이 높은 방식) ---
  function requestCredentialsViaPrompt(idField, pwField) {
    // 페이지 로드 후 0.5초 딜레이를 주어 화면이 뜬 후 자연스럽게 팝업되도록 함
    setTimeout(() => {
      const id = prompt("POSTECH SSO 자동 로그인을 위한 아이디(POVIS ID)를 입력하세요.\n(취소 시 자동 로그인을 사용하지 않습니다.)");
      // 취소를 누르거나 빈 칸으로 두면 저장하지 않고 종료
      if (id === null || id.trim() === "") return; 

      const pw = prompt("비밀번호를 입력하세요.\n(입력된 정보는 사용자 브라우저의 스크립트 저장소에만 안전하게 보관됩니다.)");
      if (pw === null || pw.trim() === "") return;

      // 스토리지에 안전하게 저장
      GM_setValue('postech_id', id.trim());
      GM_setValue('postech_pw', pw.trim());

      // 실제 폼에 값 세팅 후 로그인 처리
      idField.value = id.trim();
      pwField.value = pw.trim();

      executeLogin();
    }, 500);
  }
})();
