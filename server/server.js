//const bcrypt = require('bcryptjs'); // 기본 require 방식
// ES Module 사용(리액트와 맞춤)

import 'dotenv/config'; // dotenv 설정 방식이 변경됨
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import http from 'http'; // nodejs에서 기본제공하는 http 모듈임
// import { Server } from 'socket.io';
// import passport from 'passport';
// import { Strategy as NaverStrategy } from 'passport-naver'; // Naver passport 임포트
import User from './models/User.js'; // User db스키마 임포트
// (나중에 Product, Chat 모델도 여기에 추가)

//express 앱 설정
const app = express();
const PORT = process.env.PORT || 4600;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('몽고디비에 연결됨'))
    .catch(err => console.error('디비 연결 실패', err));

// API라우트 영역

// 인증 미들웨어 - 로그인된 사용자 인증이 필요한 라우트에 사용. 클라이언트가 보낸 헤더 정보에서 토큰을 추출해 인증함
const authMiddleware = async ( req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startWith('Bearer ')) { // 토큰이 있는지 먼저 체크
            return res.status(401).json({ message: '인증 토큰이 필요합니다.'}); 
        }
        const token = authHeader.split(' ')[1]; // Bearer 접두어를 구분해 토큰만 저장
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // jwt의 verty 메소드를 이용해 전달받은 토큰 값이 유효한지 비교.(JWT_SECRET 값을 같이 사용)
        
        // 앞에서 확인했기 때문에 필요없으며, 순서상 맞지 않는 코드임.
        // if (!decoded) {
        //     return res.status(401).json({ message: '토큰이 유효하지 안흡니다.'});
        // }

        req.user = { id: decoded.id, username: decoded.username}; // req.user에 디코드된 id와 username을 다시 담는다. 
        return next(); // 인증이 완료되면 다음 과정을 실행하도록 next()를 리턴
    } catch (errro) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.'});
    }
};

// 회원가입 라우트 
app.post('/api/users/signup', async (req, res) => {
    try {
        // 1. 프론트엔드에서 보낸 데이터를 req.body에서 꺼냅니다.
        // { username, password }는 우리가 프론트엔드와 약속한 데이터 형식입니다.
        const { username, password, email, phonenumner } = req.body;
        if (!username || !password ) {
            return res.status(400).json({message: '사용자 이름과 비밀번호는 필수 입니다.'});
        }

        // 기존 사용자가 있는지 검사
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json( {message: '이미 사용중인 계정입니다.'});
        }
        
        // 3. User 모델(설계도)로 새로운 user 인스턴스를 만든다. 
        const user = new User({ username, password, email, phonenumner });

        // 4. user.save()를 호출하면, User.js에 만들어둔 pre-save 훅이 먼저 실행되어
        //    비밀번호를 암호화하고, 그 후에 DB에 저장됩니다.
        await user.save();

        res.status(201).json({ message: '회원가입이 완되었습니다.' });

    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.'});
    }
});

app.get('/api/users/signin', async ( req, res) => {
    try {
        const { username, password } = req.body;
        // 혹시 에러가 날 경우 username: username를 username로 수정해 볼 것 
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(400).json({ message: '로그인 정보를 확인하세요.'});
        }

        // 1. bcrypt.compare는 bcrypt 라이브러리의 '약속된 함수'입니다.
        // 프론트에서 받은 평문 password와 DB의 암호화된 user.password를 비교합니다.
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return res.status(400).json({ message: '로그인 정보를 확인하세요.'});
        }
        
        // 2. jwt.sign 함수는  jsonwebtoken 라이브러리의 '약속된 함수'입니다. 이를 통해 토큰 발행
        const token = jwt.sign(
            // 첫번째 인자 토큰에 같이 담을 정보
            { id: user._id, username: user.username },
            // 두번째 인자 토큰 생성을 위함 비밀키 
            process.env.JWT_SECRET,
            // 세번째 인자 오셥으로 토큰 유효시간을 보냄
            { expiresIn: '1h'}, // 1시간 뒤 토큰 
        );

        res.status(200).json({ token, message: '로그인 성공'})

    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.'});
    }
});

app.listen(PORT, () => {
    console.log(`테디마켓 서버가 http://locathost:${PORT}에서 실행 중입니다.`)
});