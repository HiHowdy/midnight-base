import '@citizenfx/server';
import { functions } from './Functions';
import { MongoDB } from '../server';
import { Data } from '../types/player';
import { defaultMeta } from '../data/player';
import { isEmpty } from '../utils';

class PlayerManager {
	public players: { [key: string]: any } = {};

	constructor() {
		on('playerDropped', () => {
			return delete this.players[String(source)];
		});
	}

	public async fetchCharacters(source: string): Promise<any> {
		const steam = functions.getIdentifier(source, 'steam:');
		return await MongoDB.find('characters', [{ steam: steam, deleted: 0 }]);
	}

	public async login(source: string, data: object): Promise<any> {
		if (!source) return false;
		const player = new Player();
		await player.validate(source, data);
		this.setPlayer(player);
		return player;
	}

	public async createCharacter(source: string, data: object): Promise<any> {
		if (!source) return false;
		const player = new Player();
		await player.validate(source, data);
		return player;
	}

	public setPlayer(player: Player) {
		this.players[player.source] = player;
		emit('requestRefreshCommands', player.source);
	}

	public removePlayer(source: string) {
		delete this.players[source];
	}

	public fetchPlayer(source: string) {
		return this.players[source];
	}
}

export const Players = new PlayerManager();

export const fetchPlayer = (source: string) => Players.fetchPlayer(source);
global.exports('fetchPlayer', fetchPlayer);

export const fetchPlayers = () => Players.players;
global.exports('fetchPlayers', fetchPlayers);

export const fetchCharacters = async (source: string) => Players.fetchCharacters(source);
global.exports('fetchCharacters', fetchCharacters);

export const login = async (source: string, data: { [key: string]: any }) => Players.login(source, data);
global.exports('login', login);

export const createCharacter = async (source: string, data: { [key: string]: any }) => Players.createCharacter(source, data);
global.exports('createCharacter', createCharacter);

export class Player {
	public source: string;
	public data: Data = {
		stateId: '',
		steam: '',
		license: '',
		discord: '',
		name: '',
		ip: '',
		character: {},
		skin: {},
		money: {
			paycheck: 0,
			types: {
				cash: 500,
				bank: 5000,
			},
		},
		meta: {},
		employment: [],
		position: { x: 0, y: 0, z: 0, h: 0 },
		created: Date.now(),
		deleted: 0,
	};

	public async validate(source: string, data: any) {
		this.source = source;

		this.data.stateId = data.stateId || (await functions.getNewStateId(this.source));
		this.data.steam = data.steam || functions.getIdentifier(source, 'steam:');
		this.data.discord = data.discord || functions.getIdentifier(source, 'discord:');
		this.data.license = data.license || functions.getIdentifier(source, 'license:');
		this.data.ip = data.ip || functions.getIdentifier(source, 'ip:');
		this.data.name = GetPlayerName(source);

		this.data.character = data.character || {};
		this.data.character.gender = this.data.character.gender || 'male';
		this.data.character.firstName = this.data.character.firstName || false;
		this.data.character.lastName = this.data.character.lastName || false;
		this.data.character.nationality = this.data.character.nationality || 'Unknown';
		this.data.character.dob = this.data.character.dob || false;
		this.data.character.phone = this.data.character.phone || (await functions.newPhoneNumber());

		this.data.skin = data.skin || {};

		this.data.money = data.money || {
			paycheck: 0,
			types: {
				cash: 500,
				bank: 5000,
			},
		};

		this.data.meta = data.meta || defaultMeta;
		this.data.employment = data.employment || [{ name: 'unemployed', grade: 1, duty: false }];

		this.data.position = data.position || false;
		this.data.created = data.created || Date.now();
		this.data.deleted = this.data.deleted || 0;

		await this.save();
		functions.pushStateIdQueue();
	}

	public update() {
		emitNet('onUpdatePlayerData', this.source, this.data);
		this.save();
	}

	public updatePosition() {
		const ped = GetPlayerPed(this.source);
		const [x, y, z] = GetEntityCoords(ped);
		const h = GetEntityHeading(ped);
		this.data.position = { x, y, z, h };
		this.save();
	}

	public updateMeta(type: string, value: any) {
		if (!value) return false;
		this.data.meta[type.toLowerCase()] = value;
		emitNet('onMetaDataChange', this.source, type, value);
		this.update();
		return true;
	}

	public addMoney(type: string, amount: number, reason: string) {
		reason = reason || 'Unknown reason';
		type = type.toLowerCase();
		amount = +amount;

		if (amount <= 0) return false;

		if (this.data.money.types[type]) {
			this.data.money.types[type] += amount;
			emitNet('onMoneyChange', this.source, 'increase', type, amount, this.data.money.types[type]);
			this.update();
			return true;
		}

		return false;
	}

	public removeMoney(type: string, amount: number, reason: string) {
		reason = reason || 'Unknown reason';
		type = type.toLowerCase();
		amount = +amount;

		if (amount <= 0) return false;

		if (this.data.money.types[type]) {
			const newBalance = (this.data.money.types[type] -= amount);
			if (newBalance < 0) return false;
			this.data.money.types[type] = newBalance;
			emitNet('onMoneyChange', this.source, 'decrease', type, amount, this.data.money.types[type]);
			this.update();
			return true;
		}

		return false;
	}

	public setMoney(type: string, amount: number, reason: string) {
		reason = reason || 'Unknown reason';
		type = type.toLowerCase();
		amount = +amount;

		if (amount < 0) return false;

		this.data.money.types[type] = amount;
		this.update();
		return true;
	}

	public paycheck(amount: number) {
		if (amount <= 0) return false;
		this.data.money.paycheck += +amount;
		this.update();
		emitNet('onPaycheck', this.source, amount, (this.data.money.paycheck -= +amount));
	}

	public collectPaycheck() {
		const amount = this.data.money.paycheck;
		if (amount <= 0) return false;
		this.data.money.paycheck = 0;
		this.addMoney('bank', amount, 'Paycheck collection');
		this.save();
	}

	public async save() {
		const exists = await MongoDB.find('characters', [{ stateId: this.data.stateId }]);

		if (!isEmpty(exists)) {
			await MongoDB.updateOne('characters', [{ stateId: this.data.stateId }, { $set: this.data }]);
			return;
		}

		await MongoDB.insertOne('characters', this.data);
		return;
	}
}
