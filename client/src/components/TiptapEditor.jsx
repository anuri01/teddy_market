// --- 1. 도구 가져오기 (import) ---
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import './TiptapEditor.css'; // 에디터 전용 CSS 파일

// --- 2. 메뉴바 컴포넌트
const MenuBar = ({editor}) => {
    if(!editor) {
        return null;
    }
    // 추후에 에디터 기능 추가예정
    return <div className='menu-bar'>
        <button 
            type="button"
            onClick={ () => editor.chain().focus().toggleBold().run()}
            className={ editor.isActive('bold') ? 'is-active' : '' } 
        >
            굵게
        </button>
        <button type="button" onClick={()=> editor.chain().focus().toggleItalic().run()} className={ editor.isActive('italic') ? 'is-active' : '' } >기울기</button>
        <button type="button" onClick={ () => editor.chain().focus().toggleStrike().run()} className={ editor.isActive('strike') ? 'is-active' : '' } >취소선</button>
        <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        목록
      </button>
    </div>;
};

// --- 2. 메인 에디터 컴포넌트
// 부모(상품등록페이지)로 부터 content(입력내용)와 onChange(함수)를 props로 전달 받는다. 
function TiptapEditor({content, onChange}) {

    // onUpdate와 onSelectionUpdate는 메뉴바의 is-active 상태를 실시간으로 동기화하기 위해 필요합니다.
    const [_, setForceUpdate] = useState(0);

    // TiptapEditor useEdior의 훅을 사용해 인스턴스 생성. 생성시 extension객체에 배열로 각종 추가 기능을 설정한다. 
    // content, onUpdate 등 기본상태 함께 셋팅해 인스턴스 생성. 
    // 추가로 필요한 기능들은 이 훅을 통해서 추가한다. 
    const editor = useEditor({
        extensions: [
            StarterKit, // 기본적인 편집 기능 세트
            Placeholder.configure({ // 플레이스홀더 기능 설정
                placeholder:'상품 설명을 입력하세요.',
            }),
        ],
        // content: 부모로부터 받은 초기 content 값입니다.
        content: content,
        // onUpdate: 에디터 내용이 변경될 때마다 실행될 함수입니다.
        onUpdate: ({ editor }) => {
        // (질문에 대한 답) prop으로 받은 onChange 함수를 실행하여,
        // 변경된 HTML 내용을 부모 컴포넌트에 전달합니다.
        onChange(editor.getHTML());
        setForceUpdate(prev => prev +1);
        },
        onSelectionUpdate: () => {
            setForceUpdate(prev => prev + 1);
        },
    });

    useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

    // 4. 화면그리기 
    // 메뉴바와 입력영력을 그림
    return (
        <div className='tiptap-container'>
            <MenuBar editor={editor} />
            <EditorContent editor={editor}/>
        </div>
    );
};

export default TiptapEditor;
