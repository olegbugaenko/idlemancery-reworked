import React, {useContext, useEffect, useState} from "react";
import {Sidebar} from "./sidebar.jsx";
import {Popup} from "./popup.jsx";
import {useAppContext} from "../../context/ui-context";
import {Actions} from "../actions/actions.jsx";
import {Shop} from "../shop/shop.jsx";
import {Inventory} from "../inventory/inventory.jsx";
import {Property} from "../property/index.jsx";
import {Spellbook} from "../spellbook/spellbook.jsx";
import {Settings} from "../settings/index.jsx";
import {About} from "../about/index.jsx";
import {Workshop} from "../workshop/index.jsx";

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

    if(tab === 'workshop') {
        return <Workshop />
    }

    if(tab === 'spellbook') {
        return <Spellbook />
    }

    if(tab === 'settings') {
        return <Settings />
    }

    if(tab === 'about') {
        return <About />
    }

    return (<h3>Unknown tab</h3>)
}