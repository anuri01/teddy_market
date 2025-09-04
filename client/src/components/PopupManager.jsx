import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";

function PopupManager () {
    const [ popups, setPopups ] = useState([]);
    const [ title, setTitle ] = useState('');
    const [ content, setContent ] = useState('');
    const [ popupImage, setPopupImage ] = useState('');
    const [ popupEditing, setPopupEditing ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        const fetchPopup = async () => {
            try {
                const response = await api.get('/popups/all');
                setPopups(response.data);
            } catch (error) {
                toast.error('팝업 목록을 불러오는데 실패했습니다.');
            } finally setIsLoading(false);
        }
        fetchPopup();
    }, [])

    
}