import mongoose from "mongoose";

// 스키마 생성
const bannerSchema = new mongoose.Schema({
    title: {type: String, required: true},
    creator: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    imageUrl: {type: String, required: true},
    linkUrl: { type: String, required: true},
    position: {type: String, enum:['home', 'productList', 'all'], default: 'all'},
    active: { type: Boolean, default: false}, // 관리자가 활성화해야 노출
}, {timestamps:true})

export default mongoose.model('Banner', bannerSchema);
// 생성된 스키마로 모델 생성