import mongoose from "mongoose"; // 사용자 정보 db 저장
import bcrypt from "bcryptjs"; // 패스워드 암호화 저장

// schema 정의 시작
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // 필수
        unique: true, // 중복불가
        trim: true, // 자동 공백제거
    },
    password: {
        type: String,
        // required: false 소셜 로그인을 쓰기 위해 제외

    },
    email: {
        type: String,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    naverId: {
        type: String,
        unique: true,
        sparse: true,
    },
    kakaoId: { // 👈 카카오 고유 ID를 위한 필드 추가
        type: String,
        unique: true,
        sparse: true,
    }

}, { timestamps: true}); // createdAt, updateAt 자동생성

// --- 3. 설계도에 규칙(pre-save hook) 추가 ---
// (질문에 대한 답) 일반 회원가입 시에만 비밀번호 암호화가 필요하므로,
// API 로직에서 비밀번호가 있을 때만 처리하도록 하고, 스키마에서는 required를 뺍니다.

userSchema.pre('save', async function(next) {
    // isModified()는 특정 필드가 변경되었을 때만 true를 반환하는 Mongoose의 약속된 함수입니다.
    // 비밀번호가 변경되었을 때만 암호화 로직을 실행합니다.
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (erroe) {
        next(error);
    }
});

// --- 4. 설계도를 바탕으로 실제 모델(제품) 생성 및 내보내기 ---
export default mongoose.model('User', userSchema);