import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path'; // Node.js에 내장된 파일 경로 처리 도구

// --- 2. AWS S3 연결 설정 ---
// S3Client 설계도를 바탕으로, 실제 S3와 통신할 s3 객체를 만듭니다.
// .env 파일에 저장된 AWS 출입증과 지역 정보를 사용합니다.

const s3 = new S3Client({
        credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION,
});
// 디버깅 로그
// console.log('s3 인스턴스 생성', s3);

// --- 3. 업로드 기능(미들웨어) 생성 ---
// multer 라이브러리를 사용해 'upload'라는 이름의 업로드 처리반을 만듭니다.

const upload = multer({
    storage: multerS3({
        s3 : s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read',
        key: function( req, file, cb ) {
            // file.fieldname은 multer가 알려주는 파일의 '이름표'('mainImage' 또는 'attachments')입니다.
            // 이름표에 따라 파일을 다른 폴더에 저장합니다.
            // 1. 원본 파일 이름을 UTF-8 NFC 형식으로 정규화(normalize)합니다.
            const folder = file.fieldname === 'mainImage' ? 'products' : 'attachments'
            const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            cb(null, `${folder}/${Date.now()}_${path.basename(decodedName)}`);
        },
         contentType: multerS3.AUTO_CONTENT_TYPE, // 파일 타입 자동 감지
    }),
    limits: { fileSize: 5 * 1024 * 1024}, // 5MB로 제한
});

// --- 4. 완성된 기능 내보내기 ---
// 이렇게 만들어진 'upload' 처리반을 다른 파일에서 import하여 사용할 수 있도록 내보냅니다.
export { s3 };
export default upload;