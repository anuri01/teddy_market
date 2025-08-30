import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";

function BannerForm({ onBannerAdded }) {
    const [ bannerImageFile, setBannerImageFile ] = useState(null);
    const [ linkUrl, setLinkUrl ] = useState('')
    const [ isLoading, setIsLoading ] = useState(false); // 배너 등록중 버튼 중복 눌림 방지역할

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bannerImageFile) {
            toast.error('배너 이미지를 선택해주세요.');
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('linkUrl', linkUrl);
        formData.append('bannerImage', bannerImageFile);

        try {
            await api.post('/banners', formData);
            toast.success('배너가 등록됐어요.');
            setBannerImageFile(null);
            setLinkUrl('');

            //부모 컴포넌트에게 배너가 추가됐음을 알림. 
            onBannerAdded();

        } catch(error) {
            toast.error(error.response?.data?.message || '배너 등록에 실패했어요.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

     // 업로드 이미지 파일명 노출
    const handleBannerImageChange = (e) => {
        if (e.target.files.length > 0) {
            setBannerImageFile(e.target.files[0]); // 배너 파일은 배열임.
        }        
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
            <h3>배너 이미지 등록</h3>
            <p className="input-lable">배너 이미지</p>
                    <div className="file-upload-group">                      
                        <p className="file-name-display">{bannerImageFile ? bannerImageFile.name : '배너 이미지를 선택하세요.'}</p> 
                        <label htmlFor="bannerImage" className="action-button button-primary file-label-button">배너 이미지 등록</label>
                         <input id="bannerImage" 
                         className="file-input"
                         type="file"
                            accept="image/*"
                            onChange={handleBannerImageChange}
                            // onChange={(e) => setMainImageFile(e.target.files[0])}
                            />
                        </div>
                          <div className="form-group">
                        <label htmlFor="link" className="input-lable">배너링크</label>
                        <input 
                            // min="0"
                            id="link"
                            type="text"
                            className="form-input"
                            placeholder="클릭시 이동한 url을 입력하세요."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                        />
                        </div>
                        <button type="submit" className="button button-primary" disabled={isLoading}>
                            { isLoading ? '등록 중...' : '배너 등록'}
                            </button>
                </form>
        </div>
    )

}

export default BannerForm;