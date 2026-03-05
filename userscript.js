// ==UserScript==
// @name         POSTECH Auto Login & PLMS Redirect
// @namespace    https://sso.postech.ac.kr
// @version      2.0.0
// @description  포스텍 통합 로그인 자동화 및 PLMS 로그인 페이지 리다이렉트 (UI 기반)
// @match        https://sso.postech.ac.kr/*
// @match        https://plms.postech.ac.kr/login/index.php
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @author       hegelty (Modified)
// ==/UserScript==

(function() {
  'use strict';

  const url = window.location.href;

  // 1. PLMS 로그인 페이지 접속 시 SSO 스핀업 페이지로 리다이렉트
  if (url.startsWith('https://plms.postech.ac.kr/login/index.php')) {
    window.location.replace('https://plms.postech.ac.kr/passni/sso/spLogin.php');
    return;
  }

  // 2. Tampermonkey 메뉴에 '로그인 정보 초기화' 버튼 추가
  GM_registerMenuCommand('🔄 로그인 정보 초기화 (Reset Credentials)', () => {
    GM_setValue('postech_id', '');
    GM_setValue('postech_pw', '');
    alert('저장된 로그인 정보가 초기화되었습니다. 페이지를 새로고침하면 다시 입력할 수 있습니다.');
  });

  // 3. SSO 도메인 자동 로그인 로직
  if (url.includes('sso.postech.ac.kr')) {
    window.addEventListener('load', () => {
      // 입력 필드가 존재하는 로그인 화면인지 확인
      const idField = document.querySelector('#login_id');
      const pwField = document.querySelector('#login_pwd');

      if (idField && pwField) {
        // Tampermonkey 스토리지에서 저장된 정보 불러오기
        const savedId = GM_getValue('postech_id', '');
        const savedPw = GM_getValue('postech_pw', '');

        if (savedId && savedPw) {
          // 정보가 있으면 폼에 채우고 로그인 함수 실행
          idField.value = savedId;
          pwField.value = savedPw;
          
          if (typeof loginProc === 'function') {
            loginProc();
          } else {
            document.getElementsByName('loginForm')[0]?.submit();
          }
        } else {
          // 정보가 없으면 정보 입력을 위한 플로팅 UI 생성
          createLoginUI(idField, pwField);
        }
      }
    });
  }

  // --- UI 생성 함수 ---
  function createLoginUI(idField, pwField) {
    // 기존 DOM과 충돌하지 않도록 별도의 플로팅 컨테이너 생성
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.padding = '20px';
    container.style.backgroundColor = '#ffffff';
    container.style.border = '2px solid #ce2029'; // 시각적 포인트를 위한 테두리 색상
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    container.style.zIndex = '99999';
    container.style.fontFamily = 'sans-serif';

    const title = document.createElement('h3');
    title.innerText = '⚙️ 자동 로그인 설정';
    title.style.margin = '0 0 10px 0';
    title.style.fontSize = '16px';
    title.style.color = '#333';

    const desc = document.createElement('p');
    desc.innerText = '브라우저에 안전하게 저장되며, \n확장 프로그램 메뉴에서 초기화할 수 있습니다.';
    desc.style.margin = '0 0 15px 0';
    desc.style.fontSize = '12px';
    desc.style.color = '#666';
    desc.style.lineHeight = '1.4';

    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.placeholder = 'SSO ID';
    idInput.style.display = 'block';
    idInput.style.marginBottom = '10px';
    idInput.style.padding = '8px';
    idInput.style.width = '200px';
    idInput.style.border = '1px solid #ddd';
    idInput.style.borderRadius = '4px';

    const pwInput = document.createElement('input');
    pwInput.type = 'password';
    pwInput.placeholder = 'Password';
    pwInput.style.display = 'block';
    pwInput.style.marginBottom = '15px';
    pwInput.style.padding = '8px';
    pwInput.style.width = '200px';
    pwInput.style.border = '1px solid #ddd';
    pwInput.style.borderRadius = '4px';

    const saveBtn = document.createElement('button');
    saveBtn.innerText = '저장 및 로그인';
    saveBtn.style.padding = '10px';
    saveBtn.style.width = '100%';
    saveBtn.style.backgroundColor = '#ce2029';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '4px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.fontWeight = 'bold';

    // 버튼 클릭 이벤트
    saveBtn.onclick = (e) => {
      e.preventDefault();
      const id = idInput.value.trim();
      const pw = pwInput.value.trim();

      if (id && pw) {
        // Tampermonkey 스토리지에 저장
        GM_setValue('postech_id', id);
        GM_setValue('postech_pw', pw);

        // 실제 폼에 값 세팅 후 로그인 처리
        idField.value = id;
        pwField.value = pw;
        container.remove(); // UI 숨기기

        if (typeof loginProc === 'function') {
          loginProc();
        } else {
          document.getElementsByName('loginForm')[0]?.submit();
        }
      } else {
        alert('아이디와 비밀번호를 모두 입력해주세요.');
      }
    };

    // 엔터키 지원
    pwInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });

    container.appendChild(title);
    container.appendChild(desc);
    container.appendChild(idInput);
    container.appendChild(pwInput);
    container.appendChild(saveBtn);
    document.body.appendChild(container);
  }
})();
