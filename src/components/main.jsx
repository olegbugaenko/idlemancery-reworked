import React from "react";
import {Content} from "./layout/content.jsx";
import {Footer} from "./layout/footer.jsx";

export const Main = ({ readyToGo }) => {

    if(!readyToGo) {
        return (<p>Loading...</p>)
    }

    return (
        <div className={'page-wrap'}>
            <Content />
            <Footer />
        </div>
    )
}