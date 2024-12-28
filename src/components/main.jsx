import React from "react";
import {Content} from "./layout/content.jsx";
import {Footer} from "./layout/footer.jsx";

export const Main = ({ readyToGo, isLoading }) => {

    if(!readyToGo || isLoading) {
        return (<div className={'ingame-box full-size'}>
            <div className={'image'}>
                <img src={'icons/general/preloader.png'}/>
            </div>
            <div className={'loading-text'}>
                <p>Loading</p>
            </div>
        </div>)
    }

    return (
        <div className={'page-wrap'}>
            <Content />
            <Footer />
        </div>
    )
}