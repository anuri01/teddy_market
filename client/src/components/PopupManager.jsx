import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import './Admin.css'; // 관리자 전용 CSS

function PopupManager () {
    const [ popups, setPopups ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);

    // 폼 상태관리
    const [ editingPopup, setEditingPopup ] = useState(null); // 수정중인 팝업 정보
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ linkUrl, setLinkUrl ] = useState('');
    const [ type, setType ] = useState('modal');
    const [ position, setPosition ] = useState('all');
    const [ active, setActive ] = useState(false);
    const [ popupImage, setPopupImage ] = useState('');
    const [ existingMainImageUrl, setExistingMainImageUrl ] = useState('');

    const fetchPopup = async () => {
            try {
                const response = await api.get('/popups/all');
                setPopups(response.data);
                console.log('팝업목록', response.data)
            } catch (error) {
                toast.error('팝업 목록을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        }

    useEffect(() => {
        fetchPopup();
    }, [])

    const resetForm = () => {
        setEditingPopup(null);
        setTitle('');
        setContent('');
        setLinkUrl('');
        setType('modal');
        setPosition('all');
        setActive(false);
        setPopupImage(null);
        document.getElementById('popupImage').value = null; // 파일 인풋 초기화
    }

     // 수정 버튼 클릭 시 실행
    const handleEditClick = (popup) => {
        setEditingPopup(popup);
        setTitle(popup.title);
        setContent(popup.content || '');
        setLinkUrl(popup.linkUrl || '');
        setType(popup.type);
        setPosition(popup.position);
        setActive(popup.active);
        setExistingMainImageUrl(popup.imageUrl);

    }
     
    // 폼 제출(수정 또는 등록)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('linkUrl', linkUrl);
        formData.append('type', type);
        formData.append('position', position);
        formData.append('active', active);
        if(popupImage) {
            formData.append('popupImage', popupImage);
        }
        try {
            if(editingPopup) {
                await api.put(`/popups/${editingPopup._id}`, formData);
                toast.success('팝업이 수정되었습니다.')
            } else {
                await api.post('/popups', formData);
                toast.success('팝업이 등록되었습니다.');
            } 
            resetForm();
            fetchPopup();
        } catch(error) {
            toast.error("작업에 실패했습니다.");
        }
    };

        // 삭제 버튼 클릭 시 실행
    const handleDelete = async (popupId) => {
        if (window.confirm("정말 이 팝업을 삭제하시겠습니까?")) {
            try {
                await api.delete(`/popups/${popupId}`);
                toast.success('팝업이 삭제되었습니다.');
                fetchPopup(); // 목록 새로고침
            } catch (error) {
                toast.error('삭제에 실패했습니다.');
            }
        }
    };

     // 업로드 이미지 파일명 노출
    const handleBannerImageChange = (e) => {
        if (e.target.files.length > 0) {
            setPopupImage(e.target.files[0]); // 배너 파일은 배열임.
        }        
    };

    if(isLoading) {
        return (
        <div className="loading-message">
            <p>화면을 불러오는 중입니다.</p>
        </div>
        )
    }
    

    return (
        <div className="admin-manager-container">
            <div className="manager-list-section">
                <h3>전체 팝업 목록</h3>
                <table className="manager-table">
                    <thead>
                        <tr>
                            <th scope="col">번호</th>
                            <th scope="col">이름</th>
                            <th scope="col">위치</th>
                            <th scope="col">형태</th>
                            <th scope="col">사용</th>
                            <th scope="col">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 넘버링을 위해서는 두번째 인자로 배열 index를 넘겨야 한다 */}
                        { popups.map((pop, index) => ( 
                        <tr key={pop._id}>
                            <td>{index + 1}</td>
                            <td>{pop.title}</td>
                            <td>{pop.position}</td>
                            <td>{pop.type}</td>
                            <td>{pop.active ? '✔️' : '❌'}</td>
                            <td>
                                <button onClick={() => handleEditClick(pop)} className="edit-btn">수정</button>
                                <button onClick={() => handleDelete(pop._id)} className="delete-btn">삭제</button>  
                            </td>
                        </tr>))}
                    </tbody>
                </table>

            </div>

            <div className="manager-form-section">
                <h3>{editingPopup ? '팝업 수정' : '새 팝업 등록'}</h3>
                <form onSubmit={handleSubmit} className="input-form">
                    <div className="form-group">
                        <label htmlFor="title" className="input-lable">제목</label>
                    <input 
                        id="title"
                        type="text"
                        placeholder="제목" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required 
                    />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content" className="input-lable">내용</label>
                        <textarea 
                        id="content"
                        placeholder="내용 (선택)"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        />
                    </div>
                  <div className="form-group">
                    <label htmlFor="link" className="input-lable">배너 링크</label>
                    <input 
                        // min="0"
                        id="link"
                        type="text"
                        placeholder="클릭시 이동할 url을 입력하세요."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                    />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type" className="input-lable">노출 형태</label>
                    <select id="type" value={type} onChange={e => setType(e.target.value)}>
                        <option value="modal">모달</option>
                        <option value="bottom">바텀시트</option>
                    </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="position" className="input-lable">노출 위치</label>
                    <select value={position} onChange={e => setPosition(e.target.value)}>
                        <option value="all">모든 페이지</option>
                        <option value="home">홈페이지</option>
                        <option value="profile">내정보</option>
                        <option value="orderComplete">주문완료</option>
                        <option value="productList">상품목록</option>
                    </select>
                    </div>
                    <div className="file-upload-section">
                    <p className="input-lable-p">배너 이미지</p>
                    {editingPopup && existingMainImageUrl && !popupImage && (
                        <img src={existingMainImageUrl} alt="기존 대표 이미지" className="image-preview" />
                        )}
                    <div className="file-upload-group">                      
                        { !editingPopup ? (
                        <p className="file-name-display">{popupImage ? popupImage.name : '이미지를 선택하세요.'}</p> 
                        ) : (
                        <p className="file-name-display">{popupImage ? popupImage.name : '변경 이미지를 선택하세요.'}</p>)
                        }
                        <label htmlFor="popupImage" className="action-button button-primary file-label-button">이미지 등록</label>
                         <input id="popupImage" 
                         className="file-input"
                         type="file"
                            accept="image/*"
                            onChange={handleBannerImageChange}
                            // onChange={(e) => setMainImageFile(e.target.files[0])}
                            />
                        </div>
                </div>
                    
                    {/* {editingPopup && existingMainImageUrl && !popupImage && (
                        <img src={existingMainImageUrl} alt="기존 대표 이미지" className="image-preview" />
                        )}
                    <input type="file" id="popupImage" onChange={e => setPopupImage(e.target.files[0])} />
                    */}
                   <div className="form-group">
                            <fieldset>
                                <legend className="input-lable">노출여부</legend>
                                <div className="checkbox-group">
                                    <label className="placeholder-lable" htmlFor="active-checkbox">활성화</label>
                                    <input type="checkbox" id="active-checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                                </div>
                            </fieldset>
                        </div>
    
                    <div className="form-actions">
                        <button type="submit" className="button button-primary">{editingPopup ? '수정 완료' : '등록'}</button>
                        {editingPopup && <button type="button" onClick={resetForm} className="button button-secondary">취소</button>}
                    </div>

                </form>
            </div>

        </div>
    )
}

export default PopupManager;