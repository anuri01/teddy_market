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

}, {timeseries: true}); // createdAt, updatedAt 자동 생성 옵션

export default mongoose.model('Product', productSchema);