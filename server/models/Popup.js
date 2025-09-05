import mongoose from "mongoose";

const popupSchema = new mongoose.Schema({
    //특정 단어만 사용하게 하고 싶을때는 enum 키에 배열로 저장
    type: {type: String, enum:['modal', 'bottom']},
    position: {type: String, enum:['home', 'productList', 'orderComplete', 'profile', 'all'], default: 'all'},
    title: {type: String, required: true},
    content: {type: String, required: true},
    imageUrl: {type: String},
    linkUrl: {type: String},
    active: { type: Boolean, default: false}, // 관리자가 활성화해야 노출
    creator: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
}, {timestamps: true});

export default mongoose.model('Popup', popupSchema);