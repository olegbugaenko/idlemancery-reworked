import React, {useContext, useEffect, useState} from "react";
import {Sidebar} from "./sidebar.jsx";
import {Popup} from "./popup.jsx";
import WorkerContext from "../../context/worker-context";
import {useWorkerClient} from "../../general/client";
import {useAppContext} from "../../context/ui-context";
import {Actions} from "../actions/actions.jsx";
import {Shop} from "../shop/shop.jsx";
import {Inventory} from "../inventory/inventory.jsx";
import {Property} from "../property/index.jsx";
import {Spellbook} from "../spellbook/spellbook.jsx";
import {Settings} from "../settings/index.jsx";

export const Content = () => {


    const { openedTab, setOpenedTab } = useAppContext('actions');

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

    if(tab === 'shop') {
        return <Shop />
    }

    if(tab === 'inventory') {
        return <Inventory />
    }

    if(tab === 'property') {
        return <Property />
    }

    if(tab === 'spellbook') {
        return <Spellbook />
    }

    if(tab === 'settings') {
        return <Settings />
    }

    return (<h3>Unknown tab</h3>)
}