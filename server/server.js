//const bcrypt = require('bcryptjs'); // 기본 require 방식
// ES Module 사용(리액트와 맞춤)

import 'dotenv/config'; // dotenv 설정 방식이 변경됨
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import http from 'http'; // nodejs에서 기본제공하는 http 모듈임
// import { Server } from 'socket.io';
// import passport from 'passport';
// import { Strategy as NaverStrategy } from 'passport-naver'; // Naver passport 임포트
import User from './models/User.js'; // User db스키마 임포트

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

app.listen(PORT, () => {
    console.log(`테디마켓 서버가 http://locathost:${PORT}에서 실행 중입니다.`)
});