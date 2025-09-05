import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import './Admin.css'; // 관리자 전용 CSS

function BannerManager () {
    const [ banners, setBanners ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isRegistering, setIsRegistering ] = useState(false)

    // 폼 상태관리
    const [ editingBanner, setEditingBanner ] = useState(null); // 수정중인 팝업 정보
    const [ title, setTitle ] = useState('');
    const [ creator, setCreator ] = useState('');
    const [ linkUrl, setLinkUrl ] = useState('');
    const [ bannerImage, setBannerImage ] = useState('');
    const [ position, setPosition ] = useState('all');
    const [ active, setActive ] = useState(false);
    const [ existingMainImageUrl, setExistingMainImageUrl ] = useState('');

    const fetchBanners = async () => {
            try {
                const response = await api.get('/banners/all');
                setBanners(response.data);
            } catch (error) {
                toast.error('배너 목록을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        }

    useEffect(() => {
        fetchBanners();
    }, [])

    const resetForm = () => {
        setEditingBanner(null);
        setTitle('');
        setLinkUrl('');
        setPosition('all');
        setActive(false);
        setBannerImage(null);
        // document.getElementById('popupImage').value = null; // 파일 인풋 초기화
    }

     // 수정 버튼 클릭 시 실행
    const handleEditClick = (banner) => {
        setEditingBanner(banner);
        setTitle(banner.title);
        setLinkUrl(banner.linkUrl || '');
        setPosition(banner.position);
        setActive(banner.active);
        setExistingMainImageUrl(banner.imageUrl);

    }
     
    // 폼 제출(수정 또는 등록)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bannerImage && !existingMainImageUrl) {
            toast.error('배너 이미지를 선택해주세요.');
            return;
        }
        setIsRegistering(true)
        const formData = new FormData();
        formData.append('title', title);
        formData.append('linkUrl', linkUrl);
        formData.append('position', position);
        formData.append('active', active);
        if(bannerImage) {
            formData.append('bannerImage', bannerImage);
        }
        try {
            if(editingBanner) {
                await api.put(`/banners/${editingBanner._id}`, formData);
                toast.success('배너가 수정되었습니다.')
            } else {
                await api.post('/banners', formData);
                toast.success('배너가 등록되었습니다.');
            } 
            resetForm();
            fetchBanners();
        } catch(error) {
            toast.error("작업에 실패했습니다.");
        } finally {
            setIsRegistering(false)
        }
    };

        // 삭제 버튼 클릭 시 실행
    const handleDelete = async (bannerId) => {
        if (window.confirm("정말 이 팝업을 삭제하시겠습니까?")) {
            try {
                await api.delete(`/banners/${bannerId}`);
                toast.success('팝업이 삭제되었습니다.');
                fetchBanners(); // 목록 새로고침
            } catch (error) {
                toast.error('삭제에 실패했습니다.');
            }
        }
    };

    // 업로드 이미지 파일명 노출
    const handleBannerImageChange = (e) => {
        if (e.target.files.length > 0) {
            setBannerImage(e.target.files[0]); // 배너 파일은 배열임.
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
                <h3>전체 배너 목록</h3>
                <table className="manager-table">
                    <thead>
                        <tr>
                            <th scope="col">번호</th>
                            <th scope="col">이름</th>
                            <th scope="col">위치</th>
                            <th scope="col">사용</th>
                            <th scope="col">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 넘버링을 위해서는 두번째 인자로 배열 index를 넘겨야 한다 */}
                        { banners.map((banner, index) => ( 
                        <tr key={banner._id}>
                            <td>{index + 1}</td>
                            <td>{banner.title}</td>
                            <td>{banner.position}</td>
                            <td>{banner.active ? '✔️' : '❌'}</td>
                            <td>
                                <button onClick={() => handleEditClick(banner)} className="edit-btn">수정</button>
                                <button onClick={() => handleDelete(banner._id)} className="delete-btn">삭제</button>  
                            </td>
                        </tr>))}
                    </tbody>
                </table>

            </div>

            <div className="manager-form-section">
                <h3>{editingBanner ? '배너 수정' : '새 배너 등록'}</h3>
                <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title" className="input-lable">배너 이름</label>
                    <input 
                        id="title"
                        type="text"
                        placeholder="배너 이름을 입력하세요." 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required 
                    />
                </div>
                <div className="file-upload-section">
                    <p className="input-lable-p">배너 이미지</p>
                    {editingBanner && existingMainImageUrl && !bannerImage && (
                        <img src={existingMainImageUrl} alt="기존 대표 이미지" className="image-preview" />
                        )}
                    <div className="file-upload-group">                      
                        { !editingBanner ? (
                        <p className="file-name-display">{bannerImage ? bannerImage.name : '배너 이미지를 선택하세요.'}</p> 
                        ) : (
                        <p className="file-name-display">{bannerImage ? bannerImage.name : '변경 배너 이미지를 선택하세요.'}</p>)
                        }
                        <label htmlFor="bannerImage" className="action-button button-primary file-label-button">배너 이미지 등록</label>
                         <input id="bannerImage" 
                         className="file-input"
                         type="file"
                            accept="image/*"
                            onChange={handleBannerImageChange}
                            // onChange={(e) => setMainImageFile(e.target.files[0])}
                            />
                        </div>
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
                            <label htmlFor="position" className="input-lable">노출 위치</label>
                            <select id="position" value={position} onChange={e => setPosition(e.target.value)}>
                            <option value="all">모든 페이지</option>
                            <option value="home">홈페이지</option>
                            <option value="productList">상품목록</option>
                        </select>
                        </div>
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
                        <button type="submit" className="button button-primary" disabled={isRegistering}>{isRegistering ? (editingBanner ? '수정 중...' : '등록 중...') : (editingBanner ? '수정 완료' : '등록'
                        )}</button>
                        {editingBanner && <button type="button" onClick={resetForm} className="button button-secondary">취소</button>}
                    </div>
                </form>
            </div>

        </div>
    )
}

export default BannerManager;