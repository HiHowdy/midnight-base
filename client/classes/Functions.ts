import { Wait } from '../utils';

class Functions {
    setPlayerCoords(x: number, y: number, z: number, heading?: number) {
        const ped = PlayerPedId();
        let entity = ped;

        if (IsPedInAnyVehicle(ped, false)) {
            const vehicle = GetVehiclePedIsIn(ped, false);

            if (GetPedInVehicleSeat(vehicle, -1) === ped) entity = vehicle;
        }

        SetEntityCoordsNoOffset(entity, x, y, z, true, false, false);

        if (heading) SetEntityHeading(entity, heading);
    }

    public async loadModel(model: number | string) {
        if (typeof model === 'string') model = GetHashKey(model);

        do {
            RequestModel(model);
            await Wait(10);
        } while (!HasModelLoaded(model));
    }

    public async loadDict(dict: string) {
        do {
            RequestAnimDict(dict);
            await Wait(10);
        } while (!HasAnimDictLoaded(dict));
    }

    public async fixVehicle(vehicle: number, clean: boolean) {
        if (!DoesEntityExist(vehicle)) return;
        await this.requestNetworkControl(vehicle);
        SetVehicleFixed(vehicle);
        if (clean) SetVehicleDirtLevel(vehicle, 0.0);
    }

    public async spawnVehicle(
        model: string | number,
        x: number,
        y: number,
        z: number,
        h: number = 0.0,
        networked: boolean = true
    ) {
        console.log('is here');
        if (typeof model === 'string') model = GetHashKey(model);
        if (!IsModelInCdimage(model)) return;
        await this.loadModel(model);
        const vehicle = CreateVehicle(model, x, y, z, h, networked, false);
        const networkId = NetworkGetNetworkIdFromEntity(vehicle);
        SetVehicleHasBeenOwnedByPlayer(vehicle, true);
        SetNetworkIdCanMigrate(networkId, true);
        SetModelAsNoLongerNeeded(model);
        SetEntityCoordsNoOffset(vehicle, x, y, z, true, false, false);
        SetEntityHeading(vehicle, h);
        return vehicle;
    }

    public async deleteVehicle(vehicle: number) {
        this.requestNetworkControl(vehicle);
        SetEntityAsMissionEntity(vehicle, true, true);
        DeleteVehicle(vehicle);

        do {
            DeleteVehicle(vehicle);
            await Wait(100);
        } while (DoesEntityExist(vehicle));
    }

    public async requestNetworkControl(entity: number) {
        if (!DoesEntityExist(entity)) return;
        const time = GetGameTimer();

        do {
            NetworkRequestControlOfEntity(entity);
            await Wait(10);
        } while (
            !NetworkHasControlOfEntity(entity) &&
            GetGameTimer() < time + 5000 &&
            DoesEntityExist(entity)
        );
    }
}

export const functions = new Functions();

export const setPlayerCoords = (
    x: number,
    y: number,
    z: number,
    heading?: number
) => functions.setPlayerCoords(x, y, z, heading);
global.exports('setPlayerCoords', setPlayerCoords);

export const loadModel = async (model: number | string) =>
    functions.loadModel(model);
global.exports('loadModel', loadModel);

export const loadDict = async (dict: string) => functions.loadDict(dict);
global.exports('loadDict', loadDict);

export const fixVehicle = async (vehicle: number, clean: boolean) =>
    functions.fixVehicle(vehicle, clean);
    global.exports('fixVehicle', fixVehicle);

export const requestNetworkControl = async (entity: number) =>
    functions.requestNetworkControl(entity);
global.exports('requestNetworkControl', requestNetworkControl);

export const spawnVehicle = async (
    model: string,
    x: number,
    y: number,
    z: number,
    h?: number,
    networked?: boolean
) => functions.spawnVehicle(model, x, y, z, h, networked);
global.exports('spawnVehicle', spawnVehicle);

export const deleteVehicle = async (vehicle: number) => functions.deleteVehicle(vehicle);
global.exports('deleteVehicle', deleteVehicle);