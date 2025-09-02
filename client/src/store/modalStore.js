import { create } from "zustand";

// 1개만 관리할 경우 소스코드
// const useModalStore = create(set => ({
//     modalType: null, // 모달 및 바텀시트 오픈 판단 기준. 바텀과 모달 모두를 사용하기 위해 사용
//     modalProps: {}, // 동적으로 변하는 내용을 전달함
//     openModal: (type, props = {}) => set({modalType: type, modalProps: props }), // props는 추후에 쓸수 있음. 추가 정보를 전달해 동적화면 구성
//     closeModal: () => set({modalType:null, modalProps: {}}),
// }));

// 다수를 관리할 때 소스 코드
export const useModalStore = create(set => ({
    // modals 객체 안에 관리할 모달 수 만큼 키(모달이름)를 만들어 진행
    // state는 store안에 모든 상태값을 가리키는 키이다. 
    modals: {},
    openModal: (type, props = {}) => set(state => ({
        modals: {...state.modals, [type]: {open: true, props}}
    })),
    closeModal: (type) => set(state => ({
        modals: { ...state.modals, [type]: {...state.modals[type], open: false}}
    })),
}))

export default useModalStore;