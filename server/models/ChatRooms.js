import mongoose from "mongoose";

const chatRoomsSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref:'Product', required: true},
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
}, {timestamps: true});

// 복합 인덱스: 상품-구매자-판매자 조합의 유니크함을 보장하여 중복 채팅방 생성을 방지
chatRoomsSchema.index({ product: 1, buyer: 1, seller: 1 }, { unique: true });

export default mongoose.model('ChatRooms', chatRoomsSchema);