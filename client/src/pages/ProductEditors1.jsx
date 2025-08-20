import React from 'react';
// import './ProductEditor1.css';

function ProductEditor1() {
  return (
    <div className="product-editor-page">
      <h2>상품 등록</h2>
      <p className="description">판매할 상품의 정보를 입력해주세요.</p>

      <form>
        <section className="form-section">
          <h3>기본 정보</h3>
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input id="title" type="text" className="form-input" placeholder="상품 제목을 입력하세요." />
          </div>
          <div className="form-group">
            <label htmlFor="content">상세 설명</label>
            <textarea id="content" className="form-textarea" placeholder="상품 설명을 입력하세요."></textarea>
          </div>
        </section>

        <section className="form-section">
          <h3>판매 정보</h3>
          <div className="form-group">
            <label htmlFor="price">판매 가격 (원)</label>
            <input id="price" type="number" className="form-input" placeholder="판매 가격을 입력하세요." />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">상품 수량</label>
            <input id="quantity" type="number" className="form-input" placeholder="1" />
          </div>
        </section>

        <section className="form-section">
          <h3>부가 정보</h3>
          <div className="form-group">
            <label htmlFor="salePrice">할인 가격 (원)</label>
            <input id="salePrice" type="number" className="form-input" placeholder="할인 가격 (선택 사항)" />
          </div>
        </section>
        
        <section className="form-section">
          <h3>상품 이미지</h3>
          <div className="form-group">
            <label htmlFor="mainImage" className="file-label">대표 이미지 등록</label>
            <input id="mainImage" type="file" className="file-input" />
          </div>
        </section>

        <section className="form-section">
          <h3>파일 첨부</h3>
          <div className="form-group">
            <label htmlFor="attachments" className="file-label">파일 찾기</label>
            <input id="attachments" type="file" multiple className="file-input" />
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="button button-secondary">취소</button>
          <button type="submit" className="button button-primary">작성 완료</button>
        </div>
      </form>
    </div>
  );
}

export default ProductEditor1;