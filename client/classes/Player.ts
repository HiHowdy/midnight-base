import { functions } from "./Functions";

class PlayerManager {
    public updateInterval: any;
    player: number;

    constructor() {
        this.player = PlayerPedId();

        onNet('onPlayerLogin', (data: any) => {
            LocalPlayer.state.loggedIn = true;
            LocalPlayer.state.playerData = data;
            clearInterval(this.updateInterval);
            this.updateInterval = setInterval(this.updatePlayer, 1000 * 90);
        });

        onNet('onPlayerLogout', () => {
            LocalPlayer.state.loggedIn = false;
            LocalPlayer.state.playerData = {};
            clearInterval(this.updateInterval);
        });

        onNet('onUpdatePlayerData', (data: any) => {
            LocalPlayer.state.playerData = data;
        });

        onNet('mn:teleportPlayer', (x: number, y: number, z: number, heading: number) => {
            functions.setPlayerCoords(x, y, z, heading);
        })
    }

    updatePlayer() {
        if (LocalPlayer.state.loggedIn) emitNet('onRequestPlayerUpdate');
    }
}

export const player = new PlayerManager();
export const updatePlayer = () => player.updatePlayer();
