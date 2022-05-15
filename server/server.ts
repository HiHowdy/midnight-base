import '@citizenfx/server';

// Classes
import "./classes/Auth";
import "./classes/Buckets";
import "./classes/Players";
import "./classes/Functions";
import "./classes/Commands";

// Modules
import "./modules/commands";

import { functions } from './classes/Functions';
import { Wait } from './utils';

export const MongoDB = global.exports.mongodb.Load();

onNet(
    'playerConnecting',
    async (playerName: string, setKickReason: any, deferrals: any) => {
        deferrals.defer();

        const src: number = source;
        deferrals.update('\nChecking name.');

        const name = GetPlayerName(String(src));
        if (!name)
            return kickUser(src, 'Invalid username', setKickReason, deferrals);

        deferrals.update('\nChecking identifiers');
        const steam = functions.getIdentifier(String(src), 'steam:');
        const license = functions.getIdentifier(String(src), 'license:');
        const discord = functions.getIdentifier(String(src), 'discord');

        if (!steam)
            return kickUser(
                src,
                'Missing steam identifier',
                setKickReason,
                deferrals
            );
        if (!discord)
            return kickUser(
                src,
                'Missing discord identifier',
                setKickReason,
                deferrals
            );
        if (!license)
            return kickUser(src, 'Missing license', setKickReason, deferrals);

        setTimeout(() => {
            emit('connectqueue:playerConnect', src, setKickReason, deferrals);
        }, 2000);
    }
);

const kickUser = async (
    source: number,
    kickReason: string,
    setKickReason: any,
    deferrals: any
) => {
    const src = source;
    if (setKickReason) setKickReason(kickReason);

    if (deferrals) {
        deferrals.update(kickReason);
        await Wait(2500);
    }

    DropPlayer(String(src), kickReason);
    CancelEvent();
};