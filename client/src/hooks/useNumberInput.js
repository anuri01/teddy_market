import { useState, useEffect } from "react";

//숫자 입력과 콤마 포맷팅을 위한 커스텀 훅

function useNumberInput(initalValue = '') {
    // 실제 입력값을 저장할 상태
    const [ realValue, setRealValue ] = useState(initalValue);
    // 화면에 보여줄 값을 저장할 상태
    const [ displayValue, setDisplayValue ] = useState('');
    
     // 3. '진짜' 값이 바뀔 때마다, '가짜' 값을 업데이트합니다.
    useEffect(() => {
        if(realValue) {
           setDisplayValue(Number(realValue).toLocaleString());
        } else {
            setDisplayValue('');
        }
    }, [realValue]);

    // 입력창의 onChnage에 연결될 함수
    const handleChange = (e) => {
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        // 숫자만 남은 값을 저장
        setRealValue(numericValue);
    };

    return [realValue, displayValue, handleChange, setRealValue]

}

export default useNumberInput;