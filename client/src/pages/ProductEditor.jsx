import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
// import TiptapEditor from '../components/TiptapEditor'; 작업전
import useUserStore from "../store/userStore";
import useNumberInput from "../hooks/useNumberInput";
import './ProductEditor.css';

function ProductEditor() {
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ price, displayPrice, handlePriceChange, setPrice ] = useNumberInput();
    const [ salePrice, displaySalePrice, handleSalePriceChange, setSalePrice ] = useNumberInput();
    const [ quantity, displayQuantity, handleQuantityChange, setQuantity ] = useNumberInput();
    // 표시되는 값에 ,를 넣기 위해 커스텀 훅으로 변경. 
    // const [ salePrice, setSalePrice] = useState(); 
    // const [ quantity, setQuantity ] = useState();
    
    // const [ mainImageUrl, setMainImageUrl ] = useState(''); 프론트에서는 서버에 필요한 정보를 담아 요청만 보내고 저장과 저장후 url 서버에서 처리하기 때문에 해당 상태는 필요가 없음. 
    const [ mainImageFile, setMainImageFile ] = useState(null) // 대표이미지 파일 객체
    const [ attachmentFilles, setAttachmentFilles ] = useState([]); // 첨부 파일 목록

    const navigate = useNavigate();
    const { productId } = useParams(); // useParams 훅으로 url 파라미터에서 상품id를 찾아서 저장
    const isEditMode = Boolean(productId); // 수정모드 판단
    // 수정모드를 위한 useEffect는 추후 추가

    //함수 기능정의 - 이미지 파일명 노출, 첨부 파일명 노출, 상품등록 
    // 업로드 이미지 파일명 노출
    const handleMainImageChange = (e) => {
        if (e.target.files.length > 0) {
            setMainImageFile(e.target.files[0]);
        }        
    };

// 커스텀 훅으로 이관
// 숫자 입력창을 위한 공통 핸들러 함수
//   const handleNumberChange = (e, setter) => {
//     const value = e.target.value;
//     // 숫자가 아니거나 음수이면 입력을 무시합니다.
//     if (isNaN(value) || value < 0) {
//       return;
//     }
//     setter(value);
//   };

    // 첨부 파일 선택 시 실행될 함수 (e) 이벤트 객체를 받아.. files의 내용을 배열로 받아 입력. 
    const handleAttachment = (e) => { // 파일첨부 후 실행(파일 선택 창에서 파일 선택 후 닫을때 실행)
        setAttachmentFilles(prevFiles => [...prevFiles, Array(e.target.files)]);
    };

    
    // 첨부파일 삭제시 실행될 함수 x 버튼을 눌렀을떄 실행
    const handleDeleteAttachment = (indexToRemove) => { // 파일 인덱스를 받아 해당 파일 인데스를 제외하고 다시 배열 구서 
        setAttachmentFilles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };
    
    // '작성 완료' 버튼 눌렀을 때 실행될 함수 
    const handleSubmit = async (e) => {
    e.preventDefault();

    // form 데이터 객체를 만드든 후 서버와 약속된 이름을 데이터 추가
    // 배열의 경우 forEach로 배열을 순회하면서 데이터 추가 
    const formData = new FormData();

    if(!title, !content, !mainImageFile) {
        toast.error('제목, 내용, 상품이미지는 필수 입니다.');
    }

    formData.append('title', title);
    formData.append('content', content);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('salePrice', salePrice);
    if (mainImageFile) {
        formData.append('mainImage', mainImageFile)
    }
    if (attachmentFilles.length > 0) {
        attachmentFilles.forEach(file => {
            formData.append('attachments', file);
        })
    };

    try {
        if (isEditMode) {
            // 수정 로직 (차후 구현)
        } else {
            await api.post('/products', formData);
        }
         toast.success('상품이 등록되었습니다!');

    } catch (error) {
        toast.error('상품 등록에 실패했어요.');
        console.error(error);
    }
  };

    return (
        <div className="product-editor-page">
            <h2>판매할 상품을 등록하세요</h2>
            <p className="description">
                수수료없이 누구나 물건을 판매할 수있어요.
                <br/>
                상품 이미지사이즈는 840X600에 최적화 되어있어요.
            </p>
            <form onSubmit={handleSubmit}>
            <section className="form-section">
                <h3>기본정보</h3>
                    {/* <div className="form-group"> */}
                        {/* <label htmlFor="title">제목</label> */}
                        <input className="form-input"
                            id="title"
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    {/* </div> */}
                    {/* <div className="form-group"> */}
                        {/* <label htmlFor="content">상세설명</label> */}
                        <textarea className="form-textarea"
                            id="content"
                            type="text"
                            placeholder="내용을 등록하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                         <input 
                         id="quantity"
                         type="number"
                         className="form-input"
                         placeholder="상품수량을 입력하세요."
                         min="0"
                         value={quantity}
                         onChange={(e) => setQuantity(e.target.value < 0 ? 0 : e.target.value)} 
                         />
                        <input 
                            // min="0"
                            id="price"
                            type="text"
                            className="form-input"
                            placeholder="가격을 입력하세요."
                            value={displayPrice}
                            onChange={handlePriceChange}
                        />
                        <div className="file-upload-group">
                            {/* (질문에 대한 답) mainImageFile이 있으면 그 name 속성을, 없으면 플레이스홀더를 보여줍니다. */}
                            <p className="file-name-display">{mainImageFile ? mainImageFile.name : '상품이미지를 선택하세요.'}</p>
                            <label htmlFor="mainImage" className="action-button button-primary file-label-button">이미지 등록</label>
                            <input id="mainImage" 
                            className="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageChange}
                            // onChange={(e) => setMainImageFile(e.target.files[0])}
                            />
                        </div>
            </section>
            <section className="form-section">
                <h3>부가 정보</h3>
                    <input 
                    // min="0"
                    id="salePrice"
                    type="text"
                    className="form-input"
                    placeholder="할인 가격 (선택 사항)"
                    value={displaySalePrice}
                    onChange={handleSalePriceChange}
                     />
            </section>
            <section className="form-section">
                <h3>파일 첨부</h3>
                <div className="attachments-group">
                {/* <p className="form-input">첨부파일을 선택하세요.</p> */}
                    <label htmlFor="attachments" className="action-button button-secondary file-attach-button">파일 찾기</label>
                    <input 
                    id="attachments"
                    className="file-input"
                    type="file"
                    multiple
                    />
                    {/* (첨부파일 목록 UI는 나중에 추가) */}
                </div>
            </section>
                        <div className="form-actions">
                          <button type="button" className="button button-secondary button-tertiary">취소</button>
                          <button type="submit" className="button button-primary">작성 완료</button>
                        </div>
                    {/* </div> */}

        </form>
    </div>
    )
}

export default ProductEditor;