import mongoose from "mongoose";

// mongoose로 Schema 생성(설계도)
const ordersSchema = new mongoose.Schema({
     
    // buyer 필드는 User 모델의 고유 ID를 참조합니다.
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    // product 필드는 Product 모델의 고유 ID를 참조합니다.
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    // 배송지 정보를 담을 객체(정보에 따라 세부내용 달라짐)
    shippingAddress: { 
    recipientName: { type: String }, // 주문자 이름
    recipientPhone: { type: String }, // 주문자 전화번호
    postalCode: { type: String }, // 지역번호
    address1: { type: String }, // 주소
    address2: { type: String }, // 상세 주소는 선택 사항}, 
    },
    paymentMethod: { type: String},
    // 나중에 실제 결제 정보(가격, 수량 등)를 추가할 수 있습니다.

     // 주문 상태 (나중 확장을 위해 추가)
  status: {
    type: String,
    default: 'completed', // 더미 결제이므로 바로 '완료' 상태로 저장
    required: true,
  },
},
{timestamps: true});

// 설계로를 기반으로 db모델을 생성해 익스포트
export default mongoose.model('Orders', ordersSchema);
