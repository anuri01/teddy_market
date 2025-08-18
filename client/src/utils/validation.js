// 사용자 이름 유효성 검사 함수
export const validateUsername = (username) => {
    if (username.length < 4) {
        return '사용자 이름은 4자리 이상이어야 합니다.'
    }
    const regex = /^[a-zA-Z0-9]+$/;
    if (!regex.test(username)) {
        return '사용자 이름은 영문과 숫자만 사용할 수 있습니다.'
    }
    return null; // 유효하면 null 반환
};

export const validatePassword = (password) => {
    if (password.length < 8 ) {
        return '비밀번호는 8자리 이상이어야 합니다.';
    }
    const regex = /^(?=.*[A-Z]|(?=.*[0-9])|(?=.*[!@#$%^&*]))/;
    if (!regex.test(password)) {
        return '비밀번호는 영문 대문자, 숫자, 특수기호(!@#$%%^&*) 중 1개 이상 포함해야 합니다.'
    }
    return null;
}
