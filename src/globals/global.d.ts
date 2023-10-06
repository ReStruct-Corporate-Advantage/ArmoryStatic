/* eslint-disable no-var */
export { };

declare global {
	var logger: any;
	var ARMCOSTATIC: {
		appConfig?: {
			default_stuff?: Array<unknown>;
			username?: string;
			password?: string;
			app?: {
					port?: number;
			};
		}
	};
}
