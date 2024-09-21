import React, {useContext, useEffect, useState} from "react";
import {Sidebar} from "./sidebar.jsx";
import {Popup} from "./popup.jsx";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";
import {Actions} from "../actions/actions.jsx";

export const Content = () => {


    const { openedTab, setOpenedTab } = useAppContext();

    return (<div className={'content-wrap'}>
        <Sidebar />
        <div className={'content'}>
            <GetContent tab={openedTab} />

            <Popup />
        </div>

    </div>)

}

export const GetContent = ({ tab }) => {
    if(tab === 'actions') {
        return <Actions />
    }

    return (<h3>Unknown tab</h3>)
}