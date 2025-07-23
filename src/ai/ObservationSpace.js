"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObservation = getObservation;
function getObservation(playerWurm, aiWurm, terrain) {
    var terrainHeights = [];
    // Sample terrain heights at regular intervals
    var interval = 20; // Sample every 20 pixels
    for (var x = 0; x < terrain.width; x += interval) {
        // Find the highest point of the terrain at this x-coordinate
        var highestY = terrain.height;
        for (var y = 0; y < terrain.height; y++) {
            if (terrain.isColliding(x, y)) {
                highestY = y;
                break;
            }
        }
        terrainHeights.push(highestY);
    }
    return {
        playerWurmX: playerWurm.x,
        playerWurmY: playerWurm.y,
        playerWurmHealth: playerWurm.health,
        aiWurmX: aiWurm.x,
        aiWurmY: aiWurm.y,
        aiWurmHealth: aiWurm.health,
        terrainHeights: terrainHeights,
    };
}
