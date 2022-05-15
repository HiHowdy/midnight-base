import { createCommand } from '../classes/Commands';
import { fetchPlayer } from '../classes/Players';
import { setAuth } from '../classes/Auth';

createCommand(
	'ooc',
	'Send an Out of Character message',
	[{ name: 'message', help: 'The ooc message you want to send' }],
	(source: string, args: string[]) => {
		const src = String(source);
		const player = fetchPlayer(src);
		const message = args.join(' ');

		if (player) {
			const name = `${player.data.character.firstName} ${player.data.character.lastName}`;
			emitNet('chatMessage', -1, `OOC | ${name}`, false, message);
		}
	},
	0
);

createCommand(
	'setauth',
	'Set a users auth permissions',
	[
		{ name: 'source', help: 'Players source ID' },
		{ name: 'auth level', help: 'authentication level 1-100' },
	],
	async (source: string, args: string[]) => {
        const src = String(source);
        const targetSource = String(args[0]);
        const targetAuth = +args[1];
        const player = fetchPlayer(targetSource);

        if (player && IsPlayerAceAllowed(src, 'command') && targetAuth > 0) {
            await setAuth(targetSource, targetAuth);
        }
    }
);
