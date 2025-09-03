const POPUP_STATE_KEY = 'popupState';

// 팝업 상태 저장(id, days)
export const setPopupStateWithExpiry = (id, days) => {
    const now = new Date();
    now.setDate(now.getDate() + days - 1);
    now.setHours(23, 59, 59, 999);

    //기존 상태 불러오기(통합됐기 떄문)
    const stateStr = localStorage.getItem(POPUP_STATE_KEY);
    const state = stateStr ? JSON.parse(stateStr) : {};

    //id별로 만료시간 저장
    state[id] = now.getTime();
    localStorage.setItem(POPUP_STATE_KEY, JSON.stringify(state));
};

//팝업 상태(만료기간) 확인
export const getPopupState = (id) => {
    const stateStr = localStorage.getItem(POPUP_STATE_KEY);
    if (!stateStr) return null;
    const state = JSON.parse(stateStr);
    const expiry = state[id];
    if (!expiry) return false;
    if (Date.now() > expiry) {
        //만료 됐으면 삭제
        delete state[id];
        localStorage.setItem(POPUP_STATE_KEY, JSON.stringify(state));
        return false;
    }
    return true;
}

// 팝업 상태를 저장(통합 관리전)
export const setCookieWithExpiry = (key, value, days) => {
    
    // 1. '지금' 시간을 기준으로 Date 객체 생성
    const expiry = new Date(); // Date 객체 생성
    
    // 2. 만료 시간을 밀리초(ms) 타임스탬프로 계산
    expiry.setDate(expiry.getDate() + days-1) // 만료일 지정
    expiry.setHours(23, 59, 59, 999) // 만료일 23시 59분 59초 지정, 이렇게 해야 24시 기준이 아닐 해당일 자정까지 유효시간이 지정됨

    // 3. 실제 저장할 값과 만료 시간을 하나의 객체로 묶음
    const item = {
        value: value,
        expiry: expiry.getTime(), // 설정된 시간을 가져와야함. 객체 그대로를 넣으면 안됨. 
    };
    // 4. 객체를 JSON 문자열로 변환하여 localStorage에 저장
    localStorage.setItem(key, JSON.stringify(item));
};

// localStorage에서 데이터 가져오기 (만료 시간 체크)
export const getCookie = (key) => {
    // 1. localStorage에서 key에 해당하는 값(JSON 문자열)을 가져옴
    const itemStr = localStorage.getItem(key);
    
     // 2. 저장된 값이 없으면, 바로 null 반환 (더 이상 볼 필요 없음)
    if(!itemStr) {
        return null;
    }

     // 3. 가져온 JSON 문자열을 다시 원래의 객체 형태로 복원
    const item = JSON.parse(itemStr);

    // 4. '지금' 시간을 기준으로 새로운 Date 객체 생성
    const now = new Date();

    // 만료 시간이 지났으면 데이터 삭제 후 null 반환
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    
    // 7. 유통기한이 지나지 않았다면, 실제 값(item.value)을 반환
    return item.value;
}