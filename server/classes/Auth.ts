import { functions } from './Functions';
import { MongoDB } from '../server';
import { isEmpty } from '../utils';

class AuthManager {
	public auth: { [key: string]: any } = {};

	constructor() {
		on('onDatabaseIsReady', async () => {
			this.fetchAuthUsers();
		});
	}

	public async setAuth(source: string, auth: number) {
		const identifier = functions.getIdentifier(source, 'steam:');
		if (typeof identifier !== 'string') return;

		const exists = await MongoDB.find('auth', [{ identifier: identifier }]);

		isEmpty(exists)
			? await MongoDB.insertOne('auth', {
					identifier: identifier,
					auth: auth,
			  })
			: await MongoDB.updateOne('auth', [{ identifier: identifier }, { $set: { auth: auth } }]);

		this.auth[identifier] = auth;
        this.fetchAuthUsers();
	}

	public async clearAuth(source: string) {
		const identifier = functions.getIdentifier(source, 'steam:');
		if (typeof identifier !== 'string') return;

		await MongoDB.deleteMany('auth', { identifier: identifier });
		delete this.auth[identifier];
        this.fetchAuthUsers();
	}

	public hasAuth(source: string, auth: number) {
		if (auth === 0) return true;
		const isAce = IsPlayerAceAllowed(source, 'command');
		return getAuth(source) >= auth || isAce;
	}

	public getAuth(source: string) {
		const identifier = functions.getIdentifier(source, 'steam:');
		if (typeof identifier !== 'string') return 0;
		if (!this.auth[identifier]) return 0;
		return this.auth[identifier];
	}

	public async fetchAuthUsers() {
		this.auth = {};

		const users = await global.exports.mongodb.find('auth', [{}]);

		users.forEach((user: any) => {
			this.auth[user.identifier] = user.auth;
		});
	}
}

const Auth = new AuthManager();

export const setAuth = async (source: string, auth: number) => Auth.setAuth(source, auth);
global.exports('setAuth', setAuth);

export const clearAuth = async (source: string) => Auth.clearAuth(source);
global.exports('clearAuth', clearAuth);

export const hasAuth = (source: string, auth: number) => Auth.hasAuth(source, auth);
global.exports('hasAuth', hasAuth);

export const getAuth = (source: string) => Auth.getAuth(source);
global.exports('getAuth', getAuth);

export default Auth;
