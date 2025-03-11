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
import {Social} from "../social/index.jsx";
import {World} from "../world/index.jsx";
import {MainMenu} from "./main-menu.jsx";
import {SecondaryMenu} from "./secondary-menu.jsx";

export const Content = () => {


    const { openedTab, setOpenedTab } = useAppContext('actions');

    return (<div className={'content-wrap'}>
        <Sidebar />
        <div className={'content'}>
            <div className={'header'}>
                <MainMenu />
                <SecondaryMenu />
            </div>
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

    if(tab === 'world') {
        return <World />
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

    if(tab === 'social') {
        return <Social />
    }

    if(tab === 'settings') {
        return <Settings />
    }

    if(tab === 'about') {
        return <About />
    }

    return (<h3>Unknown tab</h3>)
}