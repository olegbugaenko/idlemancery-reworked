import React from "react";
import {HowActionsWorking} from "./actions.jsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import {HowActionListsWorking} from "./action-lists.jsx";
import {HowListsAutomationsWorking} from "./lists-automations.jsx";

export const HowTo = ({ scope }) => {

    let contentChunk = null;

    switch (scope) {
        case 'actions':
            contentChunk = (<HowActionsWorking />)
            break;
        case 'action-lists':
            contentChunk = (<HowActionListsWorking />)
            break;
        case 'lists-automation':
            contentChunk = (<HowListsAutomationsWorking />)
            break;
        default:
            contentChunk = (<p>{scope} tutorial</p>)
    }

    return (<div className={'how-to-wrap'}>
        <PerfectScrollbar>
            {contentChunk}
        </PerfectScrollbar>
    </div> )

}