import { hasAuth } from './Auth';
import { fetchPlayers } from './Players';
import { Player } from '../types/player';

class Commands {
	public commands: { [key: string]: any } = {};

	constructor() {
		onNet('chatMessage', (source: string, author: string, message: string) => {
			const src = String(source);
			if (!src || !message) return;

			const args = message.split(' ');
			const split = String(args[0].substring(1));
			const command = split.replace('/', '');

			args.shift();

			if (this.exists(command)) {
				if (hasAuth(src, this.commands[command].auth)) this.commands[command].callback(src, args);
			}
		})

		on('requestRefreshCommands', (source: string) => {
			this.refresh(source);
		});
	}

	public create(name: string, help: string, params: { [key: string]: any }, callback: Function, auth: number = 0) {
		if (auth && typeof auth !== 'number') auth = +auth;

		this.commands[name.toLowerCase()] = {
			name: name.toLowerCase(),
			auth: auth,
			help: help,
			params: params,
			callback: callback,
		};
	}

	public exists(name: string) {
		return this.commands[name] ? true : false;
	}

	public refresh(source: string) {
		const src = source;
		let cmds: { name: string; help: string; params: [string] }[] = [];

		for (const cmd in this.commands) {
			const auth = this.commands[cmd].auth;
			const isAce = IsPlayerAceAllowed(src, 'command');

			if (hasAuth(src, auth) || isAce)
				cmds.push({
					name: `/${this.commands[cmd].name}`,
					help: this.commands[cmd].help,
					params: this.commands[cmd].params,
				});
		}

		emitNet('chat:addSuggestions', src, cmds);
		return;
	}

	public refreshAll() {
		const players = fetchPlayers();

		players.forEach((player: Player) => {
			this.refresh(player.source);
		});
	}
}

const commands = new Commands();

export const doesCommandExist = (name: string) => commands.exists(name);
global.exports('doesCommandExist', doesCommandExist);

export const refreshCommands = (source: string) => commands.refresh(source);
global.exports('refreshCommands', refreshCommands);

export const createCommand = (name: string, help: string, params: { [key: string]: any }, callback: Function, auth: number = 0) =>
	commands.create(name, help, params, callback, auth);
global.exports('createCommand', createCommand);
