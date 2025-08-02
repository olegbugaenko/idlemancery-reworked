import React, { useContext } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { CustomButton } from "./buttons/custom-button.jsx";
import { TippyWrapper } from "./tippy-wrapper.jsx";

export const FavoriteButton = ({ type, id, isFavorite = false, className = "" }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);

    const toggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        sendData('toggle-favorite', { type, id });
    };

    return (
        <TippyWrapper content={
            <div className="hint-popup">
                <p>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</p>
            </div>
        }>
            <CustomButton
                iconId="favorite"
                className={`favorite-btn ${isFavorite ? 'favorited' : ''} ${className}`}
                onClick={toggleFavorite}
            />
        </TippyWrapper>
    );
}; 