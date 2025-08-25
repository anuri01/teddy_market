// S3 파일 삭제를 위해 aws-sdk 도구와 우리가 만든 s3 클라이언트를 가져옵니다.
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from '../upload.js';
import mongoose from "mongoose"; // 사용자 정보 db 저장

const productSchema = new mongoose.Schema({
    // 상품 제목 (필수)
    title: { type: String, required: true, trim: true},
    // 상세 내용 (필수, HTML 형식)
    content: { type: String, required: true },
    // 첨부 파일 목록 (이미지, 문서 등)
    files: [
        {
            url: { type: String },
            name: { type: String },
            type: { type: String },
        }
    ],
    // 가격 (필수)
    price: { type: Number, required: true },
    // 할인가격 (선택)
    salePrice: { type: Number },
    // 수량 (기본값 1)
    quantity: { type: Number, default: 0, required: true },
    // 판매자 정보 (User 모델과 연결, 필수)    
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     // 상품 썸네일 이미지 URL
    mainImageUrl: {type: String, required: true },

}, {timestamps: true}); // createdAt, updatedAt 자동 생성 옵션

// --- 3. 설계도에 규칙(pre-findOneAndDelete hook) 추가 ---
// 상품 삭제 시 거기에 포함된 첨부파일은 필요가 없으므로 해당 메소드 실행전 파일 삭제진행

productSchema.pre('findOneAndDelete', { document: false, query: true }, async function(next) {
    try {
        // 1. 삭제할 문서 정보를 불러옴
        const productToDelete = await this.model.findOne(this.getQuery());
        
         // 2. 삭제할 파일 목록을 담을 배열을 준비합니다.
        const filesToDelete = [];

        // 3. 대표 이미지가 있으면 삭제 목록에 추가
        if (productToDelete.mainImageUrl) {
            const MainImageKey = decodeURIComponent(new URL(productToDelete.mainImageUrl).pathname.substring(1));
            filesToDelete.push = { Key: MainImageKey };
        }
        
        // 4. 첨부 파일들이 있으면, 삭제 목록에 모두 추가합니다.
        if ( productToDelete.files && productToDelete.files.length > 0) {
            productToDelete.files.forEach(file => {
                const attachmentKey = decodeURIComponent(new URL(file.url).pathname.substring(1));
                filesToDelete.push = {Key: attachmentKey};
            }) 
            console.log(filesToDelete)
        }
        
        if(filesToDelete.length > 0) {
            console.log('s3에서 삭제할 파일들', filesToDelete);

            await Promise.all(
                filesToDelete.map(file => {
                    const command = new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: file.key,
                    });
                    s3.send(command);
                }));
        }
       next();
    } catch (erroe) {
        next(error);
    }
});

export default mongoose.model('Product', productSchema);