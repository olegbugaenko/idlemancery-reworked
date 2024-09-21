import React from "react";
import Tippy from "@tippyjs/react";

export const TippyWrapper = ({ content, children, lazy=false, onShow, onHide }) => {

    return <Tippy content={content} duration={0} placement="right" unmountHTMLWhenHide={lazy} onShow={onShow} onHide={onHide}>
        {children}
    </Tippy>
}