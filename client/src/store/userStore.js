import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// --- 2. 스토어(공용 데이터 저장소) 생성 ---
const useUserStore = create((set) => { // 로직을 통해 state가 결정되므로 묵시적 반환을 안함
     // --- 2.1. 스토어 초기 상태 설정 ---
    const token = localStorage.getItem('token');
    let intialState = {
        token: null,
        isLoggedIn: false,
        user: null,
    };
    // 앱이 처음 로드될 때, localStorage에 유효한 토큰이 있는지 확인합니다.
    if (token) {
        const decodedToken = jwtDecode(token);
         // 토큰의 만료 시간(exp)이 현재 시간보다 미래인지 확인합니다.
        if(decodedToken.exp * 1000 > Date.now()) {
            intialState = { token, isLoggedIn:true, user: decodedToken};
        } else {
            // 만료되었다면 토큰을 삭제합니다.
            localStorage.removeItem(token);
        }
    }
    
    // --- 2.2. 스토어의 내용물(상태와 액션) 반환 ---
    return {
        ...intialState, // 위에서 계산된 초기 상태를 설정합니다.
        setToken: (token) => {
             // 토큰을 해독하여 사용자 정보를 얻습니다.
            const decodedToken = jwtDecode(token);
            // 브라우저 로컬저장소에 토큰을 저장
            localStorage.setItem('token', token)
            // set()을 이용해 스토어의 상태를 업데이트하고, 앱 전체에 알립니다.
            set({ token, isLoggedIn:true, user: decodedToken});
        },

        logout: () => {
            localStorage.removeItem(token);
            set({ token: null, isLoggedIn: false, user: null});
        },
    };
});

export default useUserStore;