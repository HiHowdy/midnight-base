import '@citizenfx/server';
import { isEmpty, Wait } from '../utils';
import { MongoDB } from '../server';

class Functions {
    public isBusy: boolean = false;
    public stateIdQueue: any[] = [];

    getIdentifier(source: string, type: string) {
        for (let i = 0; i < GetNumPlayerIdentifiers(String(source)); i++) {
            const identifier = GetPlayerIdentifier(String(source), i);
            if (identifier.includes(type)) return identifier;
        }

        return false;
    }

    async joinStateIdQueue(source: number) {
        this.stateIdQueue.push({ source: source, ready: false });

        do {
            await Wait(1000);
        } while (this.stateIdQueue[0].source !== source);
    }

    public pushStateIdQueue() {
        this.stateIdQueue.shift();
    }

    async getNewStateId(source: string): Promise<string> {
        await this.joinStateIdQueue(+source);

        const latest = await MongoDB.find('characters', [
            {},
            { sort: { created: -1 } },
        ]);

        if (isEmpty(latest)) return '2001';
        const stateId = +latest[0].stateId + 1;
        const exists = await MongoDB.find('characters', [{stateId: String(stateId)}]);

        if (isEmpty(exists)) return String(stateId);
        return this.getNewStateId(source);
    }

    async newPhoneNumber(): Promise<string> {
        const number = this.generateUsNumber();
        const exists = await MongoDB.find('characters', [
            { 'character.phone': number },
        ]);
        if (!isEmpty(exists)) return this.newPhoneNumber();
        return number;
    }

    generateNumber(length: number): string {
        const addAmount = 1;
        let localMax = 11;

        if (length > localMax)
            return (
                this.generateNumber(localMax) +
                this.generateNumber(length - localMax)
            );

        localMax = Math.pow(10, length + addAmount);
        const min = localMax / 10;
        const number = Math.floor(Math.random() * (localMax - min + 1) + min);
        const strNumber = `${number}`;
        return strNumber.substring(addAmount);
    }

    generateUsNumber(): string {
        const rawNumber = this.generateNumber(10);
        return rawNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
}

export const functions = new Functions();
const getIdentifier = (source: string, type: string) => functions.getIdentifier(source, type);
global.exports('getIdentifier', getIdentifier);