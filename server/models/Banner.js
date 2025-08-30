import mongoose from "mongoose";

// 스키마 생성
const bannerSchema = new mongoose.Schema({
    imageUrl: {type: String, required: true},
    creator: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    linkUrl: { type: String, required: true}
}, {timestamps:true})

export default mongoose.model('Banner', bannerSchema);
// 생성된 스키마로 모델 생성