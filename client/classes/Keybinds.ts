class Keybinds {
	binds: any = {};

	constructor() {}

	create(id: string, label: string, defaultKey: string, callback: Function, keyUpCallback: Function, allowNui: boolean) {
		this.binds[id.toLowerCase()] = {
			id: id.toLowerCase(),
			callback: callback,
			keyUpCallback: keyUpCallback,
			defaultKey: defaultKey,
		};

		if (keyUpCallback) {
			const keyUpCmd = `-cmd_bind__${id.toLowerCase()}`;

			RegisterCommand(
				keyUpCmd,
				() => {
					this.binds[id.toLowerCase()].keyUpCallback();
				},
				false
			);
		}

		let cmd = `+cmd_bind__${id.toLowerCase()}`;

		RegisterCommand(
			cmd,
			() => {
				if (!allowNui) if (IsNuiFocused() || IsNuiFocusKeepingInput()) return;

				this.binds[id.toLowerCase()].callback();
			},
			false
		);

		RegisterKeyMapping(cmd, label, 'keyboard', defaultKey);
		TriggerEvent('chat:removeSuggestion', `/${cmd}`);
	}

	remove(id: string) {
		this.binds[id.toLowerCase()] = null;
	}

	forceBind() {
		// TODO:
	}
}

const keybinds = new Keybinds();

export const createKeybind = (id: string, label: string, defaultKey: string, callback: Function, keyUpCallback: Function, allowNui: boolean) =>
	keybinds.create(id, label, defaultKey, callback, keyUpCallback, allowNui);
global.exports('createKeybind', createKeybind);
