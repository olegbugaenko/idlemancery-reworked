import React, { useContext, useCallback } from "react";
import WorkerContext from "../../context/worker-context";
import { useWorkerClient } from "../../general/client";
import { CustomButton } from "./buttons/custom-button.jsx";

export const FavoriteButton = ({ type, id, isFavorite = false, className = "" }) => {
    const worker = useContext(WorkerContext);
    const { sendData } = useWorkerClient(worker);

    const toggleFavorite = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        sendData('toggle-favorite', { type, id });
    }, [type, id]);

    return (
        <CustomButton
            iconId="favorite"
            className={`favorite-btn ${isFavorite ? 'favorited' : ''} ${className}`}
            onClick={toggleFavorite}
        >
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </CustomButton>
    );
}; 