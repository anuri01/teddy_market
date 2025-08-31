import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatRoom: { type: mongoose.Schema.Types.ObjectId, ref:'ChatRoom', required: true},
    sender: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    content: { type: String }
}, {timestamps: true});

export default mongoose.model('Message', messageSchema);