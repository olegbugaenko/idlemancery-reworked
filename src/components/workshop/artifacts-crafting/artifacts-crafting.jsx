import React, { useState, useEffect, useContext } from 'react';
import { useWorkerClient } from "../../../general/client";
import WorkerContext from "../../../context/worker-context";

export const ArtifactsCrafting = ({ children }) => {
    const worker = useContext(WorkerContext);
    const { sendData, onMessage, removeMessage } = useWorkerClient(worker);
    
    const [slots, setSlots] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [unlockedRecipes, setUnlockedRecipes] = useState([]);
    const [currentRecipe, setCurrentRecipe] = useState(null);
    const [discoveredRecipe, setDiscoveredRecipe] = useState(null);

    useEffect(() => {
        // Load initial data
        sendData('query-artifacts-crafting-slots', {});
        sendData('query-artifacts-crafting-materials', {});
        sendData('query-unlocked-recipes', {});
        
        // Set up message handlers
        onMessage('artifacts-crafting-slots', (data) => {
            setSlots(data); // Use full slot data instead of just materialId
        });
        
        onMessage('artifacts-crafting-materials', (data) => {
            setMaterials(data);
        });
        
        onMessage('unlocked-recipes', (data) => {
            setUnlockedRecipes(data);
        });
        
        onMessage('recipe-found', (data) => {
            if (data.success) {
                setDiscoveredRecipe(data.recipe);
                // Don't clear anything automatically
            }
        });

        return () => {
            removeMessage('artifacts-crafting-slots');
            removeMessage('artifacts-crafting-materials');
            removeMessage('unlocked-recipes');
            removeMessage('recipe-found');
        };
    }, [sendData, onMessage, removeMessage]);

    const handleMaterialClick = (materialId) => {
        // Check if material is already in a slot
        const existingSlotIndex = slots.findIndex(slot => slot && !slot.isEmpty && slot.materialId === materialId);
        if (existingSlotIndex !== -1) {
            // Remove material from slot
            sendData('remove-material', { slotIndex: existingSlotIndex });
        } else {
            // Find first empty slot and add material
            const emptySlotIndex = slots.findIndex(slot => !slot || slot.isEmpty);
            if (emptySlotIndex !== -1) {
                sendData('place-material', { slotIndex: emptySlotIndex, materialId });
            }
        }
    };

    const handleSlotClick = (slotIndex) => {
        if (slots[slotIndex] && !slots[slotIndex].isEmpty) {
            sendData('remove-material', { slotIndex });
        }
    };

    const handleCheckRecipe = () => {
        if (slots.every(slot => slot && !slot.isEmpty)) {
            sendData('check-recipe', {});
        }
    };

    const handleUnlockArtifact = () => {
        // Confirm unlock in worker
        sendData('confirm-unlock', { artifactId: discoveredRecipe.artifactId });
        
        // Clear slots and reset discovered recipe
        sendData('clear-slots', {});
        setDiscoveredRecipe(null);
        
        // Show success notification briefly
        setCurrentRecipe(discoveredRecipe);
        setTimeout(() => {
            setCurrentRecipe(null);
        }, 2000);
    };

    const getMatchingArtifact = () => {
        if (slots.length === 0) return null;
        return slots[0]?.matchingArtifact || null;
    };

    const areAllSlotsGreen = () => {
        return slots.length === 3 && 
               slots.every(slot => slot && !slot.isEmpty && slot.highlighting === 'green');
    };

    const areAllSlotsRed = () => {
        return slots.length === 3 && 
               slots.every(slot => slot && !slot.isEmpty && slot.highlighting === 'red');
    };

    const isRecipeComplete = slots.every(slot => slot && !slot.isEmpty);
    const matchingArtifact = getMatchingArtifact();
    const allSlotsGreen = areAllSlotsGreen();
    const allSlotsRed = areAllSlotsRed();

    const getMaterialIcon = (materialId) => {
        const material = materials.find(m => m.id === materialId);
        if (!material) return null;
        
        return `icons/resources/${material.id}.png`;
    };

    const getMaterialName = (materialId) => {
        const material = materials.find(m => m.id === materialId);
        return material?.name || materialId;
    };

    const getSlotHighlightClass = (slot) => {
        if (!slot || slot.isEmpty) return '';
        
        switch (slot.highlighting) {
            case 'green':
                return 'highlight-green';
            case 'red':
                return 'highlight-red';
            default:
                return 'neutral';
        }
    };

    return (
        <div className={'items-wrap crafting-workshop-wrap'}>

            <div className={'items ingame-box'}>
                <div className={'menu-wrap workshop'}>
                    <div className={'head'}>
                        {children}
                    </div>
                </div>
                <div className="artifacts-crafting">
                    <div className="artifacts-crafting-header">
                        <h2>Artifact Discovery</h2>
                        <p>Place materials in slots to discover artifact recipes</p>
                    </div>

                    {/* Crafting Slots */}
                    <div className="crafting-slots">
                        <div className="slots-container flex-container">
                            {slots.map((slot, index) => (
                                <div 
                                    key={index}
                                    className={`crafting-slot icon-card item bigger ${slot && !slot.isEmpty ? 'filled' : 'empty'} ${getSlotHighlightClass(slot)}`}
                                    onClick={() => handleSlotClick(index)}
                                >
                                    <div className='icon-content'>
                                        {slot && !slot.isEmpty ? (
                                            <>
                                                <img 
                                                    src={getMaterialIcon(slot.materialId)} 
                                                    alt={getMaterialName(slot.materialId)}
                                                    className="slot-material-icon"
                                                />
                                            </>
                                        ) : (
                                            <span className="slot-placeholder">Empty Slot</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Check Recipe Button */}
                        {isRecipeComplete ? (
                            discoveredRecipe ? (
                                <button 
                                    className="check-recipe-btn active unlock-btn"
                                    onClick={handleUnlockArtifact}
                                    style={{backgroundColor: '#4CAF50', borderColor: '#4CAF50'}}
                                >
                                    Unlock {discoveredRecipe.artifactName}!
                                </button>
                            ) : allSlotsRed ? (
                                <span style={{color: '#f44336', textAlign: 'center'}}>
                                    No recipe exists for this combination
                                </span>
                            ) : (
                                <button 
                                    className={`check-recipe-btn active`}
                                    onClick={handleCheckRecipe}
                                >
                                    {allSlotsGreen && matchingArtifact ? 
                                        `Unlock ${matchingArtifact.name} Recipe` : 
                                        'Check Recipe'
                                    }
                                </button>
                            )
                        ) : (
                            <span>Fill Slots by clicking material you want to add to recipe</span>
                        )}
                    </div>

                    {/* Materials Grid */}
                    <div className="materials-section">
                        <h3>Available Materials</h3>
                        <div className="materials-grid flex-container">
                            {materials.map((material) => (
                                <div 
                                    key={material.id}
                                    className="material-item icon-card item bigger"
                                    onClick={() => handleMaterialClick(material.id)}
                                >
                                    <div className='icon-content'>
                                        <img 
                                            src={`icons/resources/${material.id}.png`}
                                            alt={material.name}
                                            className="material-icon"
                                            onError={(e) => {
                                                e.target.src = 'icons/resources/resource_placeholder.png';
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
} 