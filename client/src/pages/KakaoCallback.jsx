import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

function KakaoCallback() {
  // useSearchParams 훅은 URL의 ? 뒤에 붙는 쿼리 파라미터를 다루는 도구입니다.
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useUserStore();

  useEffect(() => {
    // searchParams.get('token')은 URL에서 'token'이라는 이름의 값을 꺼내는 '약속된 함수'입니다.
    const token = searchParams.get('token');

    // 2. 토큰이 존재하면,
    if (token) {
      // 3. Zustand 스토어에 토큰을 저장하여 로그인 상태로 만듭니다.
      setToken(token);
      // 4. 즉시 홈페이지로 이동시킵니다.
      navigate('/'); 
    } else {
      // 토큰이 없는 비정상적인 접근일 경우, 로그인 페이지로 보냅니다.
      alert('로그인에 실패했습니다.');
      navigate('/login');
    }
    // useEffect의 의존성 배열에 함수들을 넣어, 이들이 변경될 때마다 다시 실행되도록 합니다.
  }, [searchParams, navigate, setToken]);

  // 이 페이지는 사용자에게 로딩 중이라는 것만 보여줍니다.
  return <div>로그인 처리 중...</div>;
}

export default KakaoCallback;