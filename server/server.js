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
import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver'; // Naver passport 임포트
import { Strategy as KakaoStrategy } from 'passport-kakao'; // Kakao passport 임포트
import User from './models/User.js'; // User db스키마 임포트
import Product from './models/Product.js'; // Product db스키마 임포트
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

// Passport 설정(네이버 Strategy 활용)
// passport.use()는 passport에 새로운 로그인 방식을 등록하는 '약속된 함수'입니다.
passport.use(new NaverStrategy({
     // NaverStrategy는 이 객체 안에 clientID, clientSecret, callbackURL을
     // '약속된 이름'으로 넣어주길 기대합니다.
     clientID: process.env.NAVER_CLIENT_ID,
     clientSecret: process.env.NAVER_CLIENT_SECRET,
     callbackURL: '/api/users/naver/callback'

},

// 네이버로부터 프로필 정보를 성공적으로 받아올 경우 자동으로 실행되는 함수
async ( accessToken, refreshToken, profile, done ) => {
    try {
        // 1. 네이버가 제공한 공유 ID(profile.id)로 우리 db에서 사용자를 찾는다. 
        let user = await User.findOne({naverId: profile.id});
        // console.log('네이버 profile 객체의 내용', profile); // 객체 내용 확인용 로그

        // 2. 사용자가 없다면 네이버 정보를 바탕으로 가입진행
        if (!user) {
            // 2-1. username 중복방지 처리
            const username = profile.displayName;
            const existingUser = await User.findOne({ username: username} );
            let finalUsername = username;

            if (existingUser) {
                // 중복 방지: 네이버 id를 붙이거나 랜덤값 추가
                finalUsername = `${username}_${profile.id.substring(0, 5)}`; // id 일부를 잘라서 뒤로 붙임
            }

            user = new User({
                username: finalUsername, // 네이버 닉네임을 우리 서비스의 username으로 사용
                naverId: profile.id, // 네이버 고유 ID는 별도 필드에 저장
            });
            await user.save();
        }
        // 3. 찾거나 새로 만든 사용자 정보를 다음 단계로 전달합니다. done()은 '작업 완료' 신호입니다.
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}
))

// --- 👇 Passport 카카오 전략 설정 (새로 추가) ---
// passport.use()는 passport에 새로운 로그인 방식을 등록하는 '약속된 함수'입니다.
passport.use(new KakaoStrategy ({
     // KakaoStrategy는 clientID와 callbackURL을 '약속된 이름'으로 넣어주길 기대합니다.
    clientID: process.env.KAKAO_REST_API_KEY,
    callbackURL: '/api/users/kakao/callback' // 카카오 개발자 사이트에 등록한 주소
},

// 카카오로부터 프로필 정보를 성공적으로 받아왔을 때, passport가 자동으로 실행하는 함수입니다.
async ( accessToken, refreshToken, profile, done ) => {
    try {
        let user = await User.findOne({ kakaoId: profile.id.toString() });
        console.log('카카오 profile 객체의 내용', profile); // 객체 내용 확인용 로그
        if (!user) {
            // 2-1. username 중복방지 처리
            const username = profile.displayName; // 에러날 경우 실제 키값 확인 필요
            // console.log('디스플레이 네임 저장', username);
            const existingUser = await User.findOne({ username: username });
            let finalUsername = username;
            
            if (existingUser) {
                finalUsername = `${username}_${profile.id.toString().substring(0, 3)}`;
            }
            user = new User({
                username: finalUsername, // 카카오 닉네임을 우리 서비스의 username으로 사용
                kakaoId: profile.id.toString(), // 카카오 고유 id는 별도 저장
            });
            await user.save();
            
        }
        return done(null, user);
    } catch (err) {
        console.error("!!! 카카오 로그인 처리 중 에러 발생 !!!", err);
        return done(err);
    }
}
));

// 1. 로그인 시작 라우트 ('/api/users/kakao'로 접속하면 카카오 로그인 창으로 보냄)
app.get('/api/users/kakao', passport.authenticate('kakao'));

// 2. 로그인 성공 후 Callback 라우트
app.get('/api/users/kakao/callback',
     // passport.authenticate가 중간에서 카카오 정보를 받아 위에서 설정한 callback 함수를 실행합니다.
    passport.authenticate('kakao', { session: false, failureRedirect: '/login'}),
    ( req, res ) => {
    // 3. callback 함수에서 done(null, user)로 전달받은 user 정보가 req.user에 들어있습니다.
    // 이 정보로 우리 앱의 JWT 토큰을 생성합니다.

    const token = jwt.sign(
        { id: req.user._id, username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h'}
       );
        // 4. 생성된 토큰을 URL 쿼리 파라미터에 담아, 프론트엔드의 콜백 처리 페이지로 리디렉션시킵니다.
        // (이 부분은 나중에 프론트엔드에서 토큰을 받을 페이지를 만들고 연결합니다.)
        res.redirect(`${process.env.FRONTEND_URL}/auth/kakao/callback?token=${token}`);
    }
);
// --- 👇 네이버 로그인 API 라우트 (새로 추가) ---
// 1. 로그인 시작 라우트 ('/api/users/naver'로 접속하면 네이버 로그인 창으로 보냄)
app.get('/api/users/naver', passport.authenticate('naver', { authtype: 'reprompt'}));

// 2. 로그인 성공 후 Callback 라우트
app.get('/api/users/naver/callback',
    // passport.authenticate가 중간에서 네이버 정보를 받아 위에서 설정한 callback 함수를 실행합니다.
    passport.authenticate('naver', { session: false, failureRedirect: '/login'}),
    // passport인증에 성공하면, ( req, res) {....} 함수가 실행됨
    async ( req, res ) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn : '1h'}
        );
        // 4. 생성된 토큰을 URL 쿼리 파라미터에 담아, 프론트엔드의 콜백 처리 페이지로 리디렉션시킵니다.
        res.redirect(`${process.env.FRONTEND_URL}/auth/naver/callback?token=${token}`);
    }
)


// 회원가입 라우트 
app.post('/api/users/signup', async (req, res) => {
    try {
        // 1. 프론트엔드에서 보낸 데이터를 req.body에서 꺼냅니다.
        // { username, password }는 우리가 프론트엔드와 약속한 데이터 형식입니다.
        const { username, password, email, phoneNumber } = req.body;
        if (!username || !password ) {
            return res.status(400).json({message: '사용자 이름과 비밀번호는 필수 입니다.'});
        }

        // 기존 사용자가 있는지 검사
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json( {message: '이미 사용중인 계정입니다.'});
        }
        
        // 3. User 모델(설계도)로 새로운 user 인스턴스를 만든다. 
        const user = new User({ username, password, email, phoneNumber });

        // 4. user.save()를 호출하면, User.js에 만들어둔 pre-save 훅이 먼저 실행되어
        //    비밀번호를 암호화하고, 그 후에 DB에 저장됩니다.
        await user.save();

        res.status(201).json({ message: '회원가입이 완되었습니다.' });

    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.'});
    }
});

// 로그인 라우트
app.post('/api/users/login', async ( req, res) => {
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
        if (!isMatch) {
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

// 상품등록 라우트
app.post('/api/products', authMiddleware, upload.array('files', 10), async ( req, res ) => {
    
})

app.listen(PORT, () => {
    console.log(`테디마켓 서버가 http://locathost:${PORT}에서 실행 중입니다.`)
});