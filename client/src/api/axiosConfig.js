import axios from "axios";

// 마이블로그 전용 axios인스턴스 생성 및 baseURL 설정
const api = axios.create({
    // 배포시에는 env 파일 필요
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4600/api'
})

//요청인터셉트는 추후 추가 합니다. 

export default api;
