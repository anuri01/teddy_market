//const bcrypt = require('bcryptjs'); // 기본 require 방식
// ES Module 사용(리액트와 맞춤)
import 'dotenv/config'; // dotenv 설정 방식이 변경됨
import express from 'express';
import http from 'http'; // http 모듈 임포트(소켓io 사용을 위해 필요). nodejs에서 기본제공하는 http 모듈임
import { Server } from 'socket.io'; // (소켓io 서버 임포트)
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver'; // Naver passport 임포트
import { Strategy as KakaoStrategy } from 'passport-kakao'; // Kakao passport 임포트
import User from './models/User.js'; // User db스키마 임포트
import Product from './models/Product.js'; // Product db스키마 임포트
import Orders from './models/Orders.js'; // Orders db스키마 임포트
import Banner from './models/Banner.js'; // 
import ChatRooms from './models/ChatRooms.js';
import Message from './models/Message.js';
import Popup from './models/Popup.js';
import upload from './upload.js';
import { s3 } from './upload.js'; // 👈 이 줄 추가
import { memoryStorage } from 'multer';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { populate } from 'dotenv';
import { channel } from 'diagnostics_channel';
// (나중에 Product, Chat 모델도 여기에 추가)

//express 앱 설정
const app = express();

const PORT = process.env.PORT || 4600;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
const server = http.createServer(app); // Express 앱을 가지고 http 서버 생성
const io = new Server(server, { // http 서버에 socket.io 연결
    cors: { // cross orgin 설정. 프론트 사이트와 통신을 위해 설정.
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})
// --- 👇 [3. Socket.IO 로직 추가] ---
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // 사용자가 특정 채팅방에 들어오는 이벤트 
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    //사용자가 메시지를 보내는 이벤트
    socket.on('sendMessage', async({ roomId, senderId, content }) => {
         try {
             // ✅ 입력값 검증 추가
            if (!roomId || !senderId || !content.trim()) {
            socket.emit('error', { message: '필수 정보가 누락되었습니다.' });
            return;
            }
            //메시지를 db에 저장
            const newMessage = new Message({
                chatRoom: roomId,
                sender: senderId,
                content : content,
            })
            await newMessage.save();

            // populate를 통해 sender 정보를 포함해 클라이언트에게 전송
            const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username');

            // 해당 채팅방에 있는 모든 클라이언트에게 메시지 전송
            io.to(roomId).emit('receiveMessage', populatedMessage);

             // 채팅방의 updatedAt을 갱신하여 목록 정렬에 사용
            await ChatRooms.findByIdAndUpdate(roomId, { updatedAt: Date.now() });


         } catch(error) {
              console.error('메시지 전송 오류:', error);
            socket.emit('error', { message: '메시지 전송에 실패했습니다.' });
              
         }
    });
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});



// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('몽고디비에 연결됨'))
    .catch(err => console.error('디비 연결 실패', err));

// API라우트 영역 



// 인증 미들웨어 - 로그인된 사용자 인증이 필요한 라우트에 사용. 클라이언트가 보낸 헤더 정보에서 토큰을 추출해 인증함
const authMiddleware = ( req, res, next ) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) { // 토큰이 있는지 먼저 체크
            return res.status(401).json({ message: '인증 토큰이 필요합니다.'}); 
        }
        const token = authHeader.split(' ')[1]; // Bearer 접두어를 구분해 토큰만 저장
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // jwt의 verty 메소드를 이용해 전달받은 토큰 값이 유효한지 비교.(JWT_SECRET 값을 같이 사용)
         
        // 앞에서 확인했기 때문에 필요없으며, 순서상 맞지 않는 코드임.
        // if (!decoded) {
        //     return res.status(401).json({ message: '토큰이 유효하지 안흡니다.'});
        // }

        req.user = { id: decoded.id, username: decoded.username, role: decoded.role}; // req.user에 디코드된 id와 username을 다시 담는다. 
        return next(); // 인증이 완료되면 다음 과정을 실행하도록 next()를 리턴
    } catch (errro) {
        res.status(500).json({ message: '서버 오류가 발생했습니다. 인증'});
    }
};
// 관리자 인증 미들웨어
const adminMiddleware = ( req, res, next ) => {
    try {
        if (req.user && req.user.role === 'admin') {
            next(); 
        } else {
            return res.status(403).json({message: '관리 권한이 없는 사용자입니다.'})
        }
    } catch (error) {
        res.status(500).json({message: '서버 오류 발생'});
    }
}

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
        { id: req.user._id, username: req.user.username, roll: req.user.roll },
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
            { id: req.user._id, username: req.user.username, roll: req.user.roll },
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
        const user = await User.findOne({ username: username }).select('+password');

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
            { id: user._id, username: user.username, role: user.role },
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
// upload.array를 upload.fields로 변경합니다. 1개일때 single(), 1개 이름에 여러개 파일일때 array 사용
app.post('/api/products', authMiddleware, upload.fields([
    { name: 'mainImage', maxCount: 1}, { name: 'attachments', maxCount: 5}]), 
        async ( req, res ) => {
            
            try {
                const { title, content, price, saleprice, quantity } = req.body;
                // (질문에 대한 답) 대표 이미지는 req.files.mainImage 배열의 첫 번째 요소입니다.
                // 디버깅 로그
                // console.log('요청 전달', req.body);
                const mainImage = req.files.mainImage ? req.files.mainImage[0] : null;
                // 디버깅 로그
                // console.log('이미지파일 전달', mainImage);
                if (!title || !content || !price || !mainImage) {
                    return res.status(400).json({message: '제목, 내용, 가격, 상품이미지는 필수 항목입니다.'});
                }
                // req.files는 이제 { mainImage: [...], attachments: [...] } 형태의 객체입니다.
                const attachments = req.files.attachments ? req.files.attachments.map(file => ({ 
                    url: file.location,
                    name: Buffer.from(file.originalname, 'latin1').toString('utf8'), // 한글 파일명 복원
                    type : file.mimetype,
                })) : [];
                const newProduct = new Product({
                    title,
                    content,
                    price,
                    mainImageUrl: mainImage.location,
                    files: attachments,
                    salePrice: saleprice,
                    quantity: quantity,
                    seller: req.user.id,
                });
                const ProductInfo = await newProduct.save();
                res.status(201).json(ProductInfo);
            } catch (error) {
                console.error("상품 등록 중 에러 발생", error);
                res.status(500).json({message: '서버 오류가 발생했습니다.'});
            }
});

// 상품 수정 라우트
app.put('/api/products/:id', authMiddleware, upload.fields([{name: 'mainImage', maxCount:1}, { name: 'attachments', maxCount: 5}]), async ( req, res) => {
    try {
        const { title, content, price, salePrice, quantity, existingAttachments, deletedAttachments, mainImageUrl } = req.body;
        const productId = req.params.id;
        
        //(s3 파일 삭제 로직은 추후 작업)
        // const filesToDelete = JSON.parse(deletedAttachments || '[]');
        // if (filesToDelete.length > 0) {
        //     //Promise.all을 사용해 한번에 삭제처리
        //     await Promise.all(filesToDelete.map(file => {
        //         // 삭제시 필요한 파일 키 추출.
        //         const fileKey = decodeURIComponent(new URL(file.url).pathname.substring(1));
        //         console.log('S3에서 삭제 시도하는 파일 키:', fileKey);
        //         const command = new DeleteObjectCommand({
        //             Bucket: process.env.S3_BUCKET_NAME,
        //             Key: fileKey,
        //         });
        //         s3.send(command);
        //     }));
        // }

        const filesToDelete = JSON.parse(deletedAttachments || '[]');
        if (filesToDelete.length > 0) {
            // Promise.all을 사용해 여러 파일을 동시에 삭제 요청
            await Promise.all(filesToDelete.map(file => {
                const fileKey = decodeURIComponent(new URL(file.url).pathname.substring(1));
                const command = new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: fileKey,
                });
                console.log('S3에서 삭제 시도하는 파일 키:', fileKey);
                return s3.send(command);
            }));
        }
        // 기존 파일과 신규 업로드 파일을 합쳐 저장할 파일리스트 만듬. 기존 파일 목록은 json 문자열로 전달되므로 JSON.parase를 사용해 자바스크립트 객체로 변환
        const keptFiles = JSON.parse(existingAttachments || '[]');
        const newUploadFiles = req.files.attachments ? req.files.attachments.map( file => ({
            url: file.location,
            name: Buffer.from(file.originalname, 'latin1').toString('utf-8'),
            type: file.mimetype,
        })) : [];
        const finalFiles = [...keptFiles, ...newUploadFiles];
        
        // 업데이트 상품 객체 생성
        const updateData = {
            title,
            content,
            price,
            salePrice,
            quantity,
            files: finalFiles,
        };
        // 상품이미지를 다시 올렸을 경우 확인해 업데이트 
        const newMainImage = req.files.mainImage ? req.files.mainImage[0].location : null;
        if(newMainImage) {
            updateData.mainImageUrl = newMainImage;
        } 
        console.log('수정파일 최종정보 저장', updateData);

        console.log('=== 상품 수정 시작 ===');
        console.log('productId:', productId);
        console.log('req.user.id:', req.user.id);
        console.log('updateData:', updateData);
        const updateProduct = await Product.findOneAndUpdate(
            { _id: productId, seller: req.user.id }, // 업데이트 조건: ID일지, 작성자 일치
            updateData, // 업데이트 할 내용(객체)
            { new: true } // 옵션: 업데이트된 문서를 반환(updateProduct로 반환됨)
        );
        
        console.log('저장객체 정보', updateProduct)

        if (!updateProduct) {
            return res.json(404).json({messge:'상품이 없거나 판매자가 아닙니다.'});
        }

        res.status(201).json(updateProduct);
    } catch (error) {
        console.error('상품 수정 중 에러 발생')
        res.status(500).json({message: '서버 오류가 발생했습니다. 정보수정'});
    }
});

// 상품 삭제 라우트
app.delete('/api/products/:id', authMiddleware, async ( req, res ) => {
    try {
        const productId = req.params.id;
        // findOneAndDelete를 호출하면, 위에서 만든 pre 훅이 자동으로 먼저 실행됩니다.
        const deletedProduct = await Product.findOneAndDelete({
            _id: productId,
            seller: req.user.id,
        });
        
        if (!deletedProduct) {
            res.status(404).json({message: '상품이 없거나 삭제할 권한이 없습니다.'});
        }
        res.json({message: '상품이 성공적으로 삭제되었습니다.'});
    } catch (error) {
        res.status(500).json({message: '서버오류 상품삭제'});
    }
})
// 상품상세 라우트 :id의 : 는 뒤에 변수를 사용하겠다는 선언
// 클라이언트에서 전달받은 id를 가지고 Product 모델에서 해당 데이터를 찾아 인스턴스를 생성하고 해당 객체를 응답해주는 라우트
app.get('/api/products/:id', async( req, res ) => {
    try {     
        // populate는 db에서 데이터를 찾아올때 적용가능. (앞인자, 뒷인자) 앞인자는 데이터를 추가로 넣을 키 값, 뒷 값은 추가로 넣을 키 값 설정. 여기서는 seller에는 User모델의 id만 들어 있음. 키값은 문자열로 전달되어야 함. 
        const product = await Product.findById(req.params.id).populate('seller', 'username');
        if(!product) {
            return res.status(404).json({message: '상품을 찾을 수 없습니다.'});
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: "서버 오류가 발생했습니다.(상품상세)"});
    }
});

// 상품목록 라우트
app.get('/api/products', async( req, res ) => {
    try {
        // 페이지네이션 추가 : URL 쿼리에서 page와 limit 값을 가져옵니다. 없으면 기본값을 사용합니다.
        // const page = parseInt(req.query.page) || '1';
        const limit = parseInt(req.query.limit) || '4';
        
        // req에 오는 페이지 넘버에 따라 건너뛸 상품 개수를 지정
        // const skip = ( page -1 ) * limit;

        // find({})는 db의 모든 정보를 가져오는 메소드. 전체 목록을 가져올때는 sort 메소드를 사용해 
        // 전체 상품목록에서 스킵할 상품개수와 불러올 상품개수를 지정해 담는다. 
        const products = await Product.find({}).sort({createdAt: -1}).limit(limit).populate('seller', 'username');

        // 전체 상품개수를 세, 총 몇 페이지가 필요한지 계산
        const totalProducts = Product.countDocuments();
        const totalPage = Math.ceil(totalProducts/limit); // Math.celi는 올림함수.

        res.status(200).json({products});
    } catch(error) {
        res.status(500).json({message: '서버 오류가 발생했습니다.(상품전체목록)'})
    }
});

app.get('/api/allproducts', async( req, res ) => {
    try {
        // 페이지네이션 추가 : URL 쿼리에서 page와 limit 값을 가져옵니다. 없으면 기본값을 사용합니다.
        const page = parseInt(req.query.page) || '1';
        const limit = parseInt(req.query.limit) || '4';
        
        // req에 오는 페이지 넘버에 따라 건너뛸 상품 개수를 지정
        const skip = ( page -1 ) * limit;

        // find({})는 db의 모든 정보를 가져오는 메소드. 전체 목록을 가져올때는 sort 메소드를 사용해 
        // 전체 상품목록에서 스킵할 상품개수와 불러올 상품개수를 지정해 담는다. 
        const products = await Product.find({}).sort({createdAt: -1}).skip(skip).limit(limit).populate('seller', 'username');

        // 전체 상품개수를 세, 총 몇 페이지가 필요한지 계산
        const totalProducts = await Product.countDocuments();
        const totalPage = Math.ceil(totalProducts/limit); // Math.celi는 올림함수.

        res.status(200).json({ products, totalPage, currentPage: page, totalProducts });
    } catch(error) {
        res.status(500).json({message: '서버 오류가 발생했습니다.(상품전체목록)'})
    }
});

// 구매하기 - 주문서 생성
app.post('/api/orders/initiate', authMiddleware, async (req, res) => {
    try { 
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({message: '상품 ID가 필요합니다.'});
        }
         // 새로운 주문 문서를 'pending' 상태로 생성합니다.
        const newOrder = new Orders({
            product: productId,
            buyer: req.user.id,
            status: 'pending',
        })
        await newOrder.save();
        res.status(201).json({ orderId: newOrder._id }); // 이름표를 달아서 주문id전달

    } catch(error) {
        res.status(500).json({message: '서버 오류 발생(구매)'})
    }

});

// 구매하기 - 배송지 정보 및 결제수단 저장
app.put('/api/orders/:orderId/shipping', authMiddleware, async ( req, res) => {
    try {
        // const shipData = req.body; // 구조분해 할당도 가능하지만 용도에 맞지 않음. 
        const { shippingAddress, paymentMethod } = req.body;
        const { orderId } = req.params; // 구조분해 할당으로 가져옴. 구조분해 할당은 원시데이터는 안됨. 구분이 안될때는 데이터 타입을 찍어봐야 함. 
        const updateToShippingInfo = await Orders.findOneAndUpdate(
            {_id: orderId, buyer: req.user.id}, // 구매자가 일치하는지도 재확인
            {$set: {shippingAddress, paymentMethod }}, // $set 명령으로 해당하는 필드만 업데이트. 이걸 사용하지 않으면 업데이트 내용이 없는 기존 필드가 삭제됨
            {new: true}
            );
    if(!updateToShippingInfo) {
        return res.status(404).json({message:'주문을 찾을 수 없거나 권한이 없습니다.'});
    }
    res.json(updateToShippingInfo);

    } catch(error) {
        console.error("배송지 정보 추가 중 에러 발생:", error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
})

// 구매하기 - 구매완료(결제완료)
app.put('/api/orders/:orderId/complete', authMiddleware, async ( req, res ) => {
    try {
        const { isPaid } = req.body;
        const { orderId } = req.params;
        if (!isPaid) {
            return res.status(400).json({message: '결제 처리가 되지 않았습니다.'})
        }
        const orderComplete = await Orders.findOneAndUpdate(
            {_id: orderId, buyer: req.user.id},
            { $set: {status: 'complete', isPaid }},
            { new: true}
        ).populate({  // popullate를 중첩해 상품정보와 판매자 이름까지 가지고 옴. 가져올 필드 및 db명은 텍스트 형태로 보내야 함. 객체나 변수명 형태 아님! 객체 키값을 만들어 객체 형태로 가져올 수 있음. 
            path: 'product',
            populate: {
                path: 'seller',
                select: 'username', // seller username 필드만 선택
            },
        }).populate('buyer', 'username')
         
        if(!orderComplete) {
            return res.status(404).json({message: '주문정보를 찾을 수 없습니다.'});
        }
        res.json(orderComplete);
    } catch(error) {
        console.error("주문 완료 처리 중 에러 발생", error);
        res.status(500).json({message: '서버 오류 발생(완료처리)'});
    }
});

// 구매하기 - 구매정보 전달
app.get('/api/orders/:orderId', authMiddleware, async ( req, res ) => {
    try {
    const { orderId } = req.params;
    const orderInfo = await Orders.findOne({_id: orderId, buyer: req.user.id, status: 'complete', isPaid: true }).populate([ {
        path: 'product',
        populate: {
            path: 'seller',
            select: 'username'
            },
        },
        { path: 'buyer',
          select: 'username',
        }
    ]);
    if(!orderInfo) {
        return res.status(404).json({message:'완료된 주문을 찾을 수 없습니다.', redirect: '/productlist'}); //클라이언트에서 리디렉션 정보 제공
        
    }
    res.json(orderInfo);
    } catch (error) {
        res.status(500).json({message: '서버오류 발생'});
    }
})

// 주문 정보 조회 (구매 페이지용)
app.get('/api/orders/:orderId/info', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Orders.findOne({
            _id: orderId,
            buyer: req.user.id
        }).populate('product').populate('buyer', 'username');
        
        if (!order) {
            return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('주문 정보 조회 실패:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 주문 정보 조회(내정보 페이지용)
app.get('/api/users/my-orders', authMiddleware, async (req, res) => {
    try {
        // const { buyer } = req.body;
        // if(!buyer === req.user.id) {
        //     return res.status(400).json({message: '주문자와 로그인한 사용자가 일치하지 않습니다.'});
        // }
        const orders = await Orders.find({buyer: req.user.id, isPaid:  true, status: 'complete'}).sort({createdAt : -1}).populate(
            {
                path:'product',
                populate: {
                    path:'seller',
                    select:'username'
                },
            }
        );
        res.json(orders);
    } catch(error) {
        console.error('구매내역 정보 조회 실패:', error);
        res.status(500).json({message: '서버오류 발생'});
    }
});

// 등록 상폼 조회(내정보 페이지용)
app.get('/api/users/my-products', authMiddleware, async (req, res) => {
    try {
        const myProducts = await Product.find({seller: req.user.id}).sort({createdAt: -1 });
        if(!myProducts) {
            return res.status(404).json({message: '판매 등록한 상품이 없습니다.'});
        };
        res.json(myProducts);
    }catch(error) {
        console.error('판매상품 정보 조회 실패:', error);
        res.status(500).json({message: '서버오류 발생'});
    }
});

// 사용자 정보 조회(내정보 페이지용)
app.get('/api/users/my-profile', authMiddleware, async (req, res) => {
    try {
        const profileRes = await User.findById(req.user.id).select('-password');
        if(!profileRes) {
            return res.status(404).json({message:'사용자 정보가 없습니다.'});
        }
        res.json(profileRes);
    } catch(error) {
        res.status(500).json({message: '서버 오류 발생'});
    }
});

// 사용자 정보 수정(내정보 페이지용)
app.put('/api/users/my-profile', authMiddleware, async (req, res) => {
    try {
        const { email, phoneNumber, currentPassword, newPassword } = req.body;
        // .select('+password')를 사용해 password 필드를 명시적으로 가져옵니다. 
        const myProfile = await User.findById(req.user.id).select('+password');
         if (!myProfile) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 이메일과 전화번호 업데이트
        if (email !== undefined) myProfile.email = email;
        if (phoneNumber !== undefined) myProfile.phoneNumber = phoneNumber;

        if(newPassword) {
            if(!myProfile.password) {
                return res.status(400).json({message:'소셜 로그인 사용자는 비밀번호 변경이 불가능합니다.'});
            }
            if(!currentPassword) {
                return res.status(400).json({message:'현재 비밀번호를 입력해 주세요.'});
            }
            const isMatch = await bcrypt.compare(currentPassword, myProfile.password);
            if(!isMatch) {
                return res.status(400).json({message:'비밀번호가 일치하지 않습니다.'});
            } else if(currentPassword === newPassword) {
                return res.status(400).json({message:'현재 비밀번호과 동일한 비밀번호는 사용할수 없습니다.'});
            } else {
                myProfile.password = newPassword;
            }
        }
        await myProfile.save();
        res.status(200).json({message: '정보 수정이 완료되었습니다. '})
 
    } catch(error) {
        res.status(500).json({message: '서버 오류 발생'});
    }
})


// --- 👇 [2. 채팅 관련 API 라우트 추가] ---
// 채팅 시작 또는 기존 채팅방 가져오기
app.post('/api/chat/initiate', authMiddleware, async(req, res) => {
    try {
        const { productId, sellerId } = req.body;
        const buyerId = req.user.id;

        //기존 채팅방이 있는지 확인
        let chatRoom = await ChatRooms.findOne({product: productId, seller: sellerId, buyer: buyerId})
        
        if (!chatRoom) {
            chatRoom = new ChatRooms({
                product: productId,
                seller: sellerId,
                buyer: buyerId,
                participants: [buyerId, sellerId],
            });
            await chatRoom.save();
        }
        chatRoom = await ChatRooms.findOne({product: productId, seller: sellerId, buyer: buyerId}).populate('seller', 'username').populate('buyer', 'username');
        res.status(200).json(chatRoom);
    } catch(error) {
        res.status(500).json({message: '채팅방 시작 중 오류 발생'});
    }
});

//내 채팅방 목록가져오기
app.get('/api/chat/rooms', authMiddleware, async(req,res) => {
    try {
        const rooms = await ChatRooms.find({ participants: req.user.id }).populate('seller', 'username').populate('buyer', 'username').populate('product', 'mainImageUrl title').sort({updatedAt: -1}); // 참가자에서 로그인한 사용자 id로 검색하고 채팅방 ui구성에 필요한 내용을 populate로 가져옴.
        res.json(rooms);
    } catch(error) {
        res.status(500).json({message: '채팅방 목록 조회 중 에러 발생'});
    }
});

//특정 채팅방 메시지 가져오기
app.get('/api/chat/rooms/:roomId/messages', authMiddleware, async(req, res) => {
 try {
    const { roomId } = req.params;
    const message = await Message.find({chatRoom: roomId}).populate('sender', 'username').sort({createdAt: 'asc'});
    res.json(message)

 } catch(error) {
        res.status(500).json({message: '메시지 조회 중 에러 발생'});
 } 
});

// 채팅방 삭제
app.delete('/api/chat/rooms/:roomId', authMiddleware, async(req, res) => {
  try {
    const { roomId } = req.params;
    const isMatch = await ChatRooms.findOne({_id: roomId, participants: req.user.id})
    if(!isMatch) {
        return res.status(400).json({message: '삭제 권한이 없거나 대화방이 존재하지 않습니다.'})
    }
    await Message.deleteMany({chatRoom: roomId});
    await ChatRooms.findByIdAndDelete(roomId);
    
    res.json('대화방이 삭제되었습니다.')
  } catch(error) {
    res.status(500).json({message:'대화방 삭제 중 오류가 발생했습니다.'});
  }
})

// 배너 등록
app.post('/api/banners', authMiddleware, adminMiddleware, upload.single('bannerImage'), async(req, res) => {
    try {
        const { linkUrl, title, position, active } = req.body;
        const image = req.file;

        if(!image) {
            return res.status(400).json({message:'배너 이미지는 필수 입니다.'});
        }
        const newBanner = new Banner({
            imageUrl: image.location,
            title: title,
            position: position,
            active: active === 'true', // 텍스트로 전달되기 때문에 부울린 값으로 변환해서 저장
            linkUrl: linkUrl || '',
            creator: req.user.id,
        })
        await newBanner.save();
        res.status(201).json(newBanner);

        } catch(error) {
            res.status(500).json({message:'서버 오류 발생'});
        }
})

// 배너 수정
app.put('/api/banners/:id', authMiddleware, adminMiddleware, upload.single('bannerImage'), async(req, res) => {
    try {
        const bannerId = req.params.id;
        const { linkUrl, title, position, active } = req.body;

        const banner = await Banner.findById(bannerId);
         if (!banner) {
            return res.status(404).json({ message: '수정할 배너를 찾을 수 없습니다.' });
        }
        const oldImageUrl = banner?.imageUrl;
        
        // [수정] Mongoose 문서의 속성을 직접 변경합니다.
        banner.title = title;
        banner.position = position;
        banner.linkUrl = linkUrl;
        banner.active = active === 'true' ? true : false;

        if (req.file?.location) {
        const fileKey = decodeURIComponent(new URL(oldImageUrl).pathname.substring(1));
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
        });
        await s3.send(command);
        banner.imageUrl = req.file.location
        }
        await banner.save()
        res.status(200).json(banner);
    } catch(error) {
        res.status(500).json({message: '배너 수정 중 오류 발생'});
    }
})


//배너 목록 조회(사용자용)
app.get('/api/banners/active/:position', async (req, res) => {
    try {
        const position = req.params.position;
        // 중복 조건은 배열로 넘김
        const banners = await Banner.find({active: true, position: { $in: [position, 'all'] }}).sort({createdAt: -1 });
        if(!banners) {
            return res.status(404).json({message: '등록된 배너가 없습니다.'});
        } 
        res.json(banners);
    } catch (error) {
        console.error('배너 조회 중 에러 발생', error);
        res.status(500).json({message: '서버 오류 발생'});
        }

}) 

//배너 목록 조회(관리자용)
app.get('/api/banners/all', async (req, res) => {
    try {
        const banners = await Banner.find({}).sort({createdAt: -1 });
        if(!banners) {
            return res.status(404).json({message: '등록된 배너가 없습니다.'});
        } 
        res.json(banners);
    } catch (error) {
        console.error('배너 조회 중 에러 발생', error);
        res.status(500).json({message: '서버 오류 발생'});
        }

}) 

// 배너 삭제(관리자 전용)
app.delete('/api/banners/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const bannerId = req.params.id;
        const banner = await Banner.findById(bannerId);
        if(!banner) {
            res.status(404).json({message: '삭제할 배너를 찾을 수 없습니다.'});
        }

        const fileKey = decodeURIComponent(new URL(banner.imageUrl).pathname.substring(1));
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
        });
        await s3.send(command);
        
        await Banner.findByIdAndDelete(bannerId);
        res.json({message:'배너가 성공적으로 삭제되었습니다.'});
    } catch(error) {
        res.status(500).json({message: '서버 오류 발생'});
    }
});

// 상품 검색
app.get('/api/search', async (req, res) => {
    try {
        const { keyword } = req.query;
        if(!keyword) {
            return res.status(400).json({message: '검색어를 입력해 주세요.'});
        } else if(keyword.length > 30) {
            throw new Error('검색어가 너무 깁니다.');
        }
        // 특수문자 리플레이스 함수 '$&' 조건에 맞는 문자 그래도 치환한다는 의미 $* 식으로 여러 옵션이 있음. 특수문자 앞에 \를 붙여서 치환함
        function escapeRegex(text) {
            return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // 정규표현식으로 사용해 대소문자 구분 없이 검색
        const safeKeyword = escapeRegex(keyword);
        // 정규식 객체로 사전에 만듬. 권장은 몽고db에 직접 사용 
        const searchRegex = new RegExp(safeKeyword, 'i');

        // ✅ 학습용 디버깅 로그
        // console.log('=== 검색 방식 비교 학습 ===');
        // console.log('원본 키워드:', keyword);
        // console.log('안전한 키워드:', safeKeyword);
        // console.log('정규식 객체:', searchRegex);
        // console.log('MongoDB 쿼리 조건:');
        // console.log('  - title 검색:', {$regex: safeKeyword, $options: 'i'});
        // console.log('  - content 검색:', searchRegex);

        const searchResult = await Product.find({$or: [
            // 몽고 db의 졍규식 연사자를 직접 사용함
            {title: {$regex: safeKeyword, $options: 'i'}},
            {content: searchRegex}
        ]}).sort({createdAt: -1}).populate('seller', 'username');

        if(searchResult.length === 0) {
            return res.status(404).json({message: '조건에 맞는 상품이 없습니다.'});
        }
        res.json(searchResult);
    } catch(error) { 
        console.error('상품 검색 중 에러 발생:', error);
        res.status(500).json({message: '서버 오류 발생'});
    }
});

// 팝업 생성(관리자)
app.post('/api/popups', authMiddleware, adminMiddleware, upload.single('popupImage'), async(req, res) => {
    try {
        const { type, position, title, content, linkUrl, active} = req.body;
        const newPopup = new Popup({
            type,
            position,
            title,
            linkUrl,
            content,
            active: active === 'true', // 텍스트로 전달되기 때문에 부울린 값으로 변환해서 저장
            imageUrl: req.file?.location || '',
            creator: req.user.id,
        });
        await newPopup.save();
        res.status(200).json(newPopup);
    } catch(error) {
        res.status(500).json({message: '팝업 생성 중 오류 발생'});
    }
});

//전체 팝업 조회(관리자)
app.get('/api/popups/all', authMiddleware, adminMiddleware, async(req,res) => {
    try {
        const allPopups = await Popup.find({}).sort({createdAt: -1});
        res.status(200).json(allPopups);
    } catch(error) {
        res.status(500).json({message: '팝업 리스트를 가져올 때 오류 발생'});
    }
});

// 팝업 삭제(관리자)
app.delete('/api/popups/:id', authMiddleware, adminMiddleware, async(req, res) => {
    try{

     const popupId = req.params.id;
        const popup = await Popup.findById(popupId);
        if(!popup) {
            res.status(404).json({message: '삭제할 팝업을 찾을 수 없습니다.'});
        }

        const fileKey = decodeURIComponent(new URL(popup.imageUrl).pathname.substring(1));
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
        });
        await s3.send(command);
        
        await Popup.findByIdAndDelete(popupId);
        res.json({message:'팝업이 성공적으로 삭제되었습니다.'});
    } catch(error) {
        res.status(500).json({message: '서버 오류 발생'});
    }

});

// 팝업 수정(관리자)
app.put('/api/popups/:id', authMiddleware, adminMiddleware, upload.single('popupImage'), async(req,res) => {
    try {
        const popupId = req.params.id;
        const { title, content, type, position, linkUrl, active } = req.body;
        const popup = await Popup.findById(popupId);
         if (!popup) {
            return res.status(404).json({ message: '수정할 팝업을 찾을 수 없습니다.' });
        }
        const oldImageUrl = popup?.imageUrl;

    // [수정] Mongoose 문서의 속성을 직접 변경합니다.
        popup.title = title;
        popup.content = content;
        popup.type = type;
        popup.position = position;
        popup.linkUrl = linkUrl;
        popup.active = active === 'true' ? true : false;

        if (req.file?.location) {
        const fileKey = decodeURIComponent(new URL(oldImageUrl).pathname.substring(1));
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
        });
        await s3.send(command);
        popup.imageUrl = req.file.location
        }
        await popup.save()
        res.status(200).json(popup);
    } catch(error) {
        res.status(500).json({message: '팝업 리스트를 가져올 때 오류 발생'});
    }
});

// --- 특정 팝업 1개 정보 조회 (관리자용) ---
app.get('/api/popups/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const popup = await Popup.findById(req.params.id);
        if (!popup) {
            return res.status(404).json({ message: '팝업을 찾을 수 없습니다.' });
        }
        res.json(popup);
    } catch (error) {
        res.status(500).json({ message: '팝업 조회 중 오류 발생' });
    }
});

// 활성화된 팝업 목록 조회(사용자 패이지용)
app.get('/api/popups/active/:position', async(req, res) => {
    try {
        const { position } = req.params;
        const isActivePopups = await Popup.find({active: true, 
        $or: [{position: position}, {position: 'all'}] // 특정위치 또는 'all' 팝업 $or 사용예
        }).sort({createdAt: - 1}) ;
        if(!isActivePopups) {
            res.status(404).json({message: '활성화된 팝업이 없습니다.'})
        }
        res.status(200).json(isActivePopups);
    } catch(error) {
        res.status(500).json({message: '상품활성 팝업 조회 중 오류 발생'});
    }
})



server.listen(PORT, () => { // app -> server 로 수정
    console.log(`테디마켓 서버가 http://locathost:${PORT}에서 실행 중입니다.`)
});
