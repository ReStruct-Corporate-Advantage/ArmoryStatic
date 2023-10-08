import { ARMCO_CONFIG } from "@armco/node-starter-kit/types/config.interface";

/* eslint-disable no-var */
export { };

declare global {
	var logger: any;
	var ARMCOSTATIC: {
		config?: ARMCO_CONFIG
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
