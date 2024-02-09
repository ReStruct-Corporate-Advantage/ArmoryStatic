import potrace from "potrace";
import fs from "fs";
import { ObjectType } from "@armco/node-starter-kit/types/types";

class PngToSvgConverter {
	static async convert(icons: Array<string>, params?: ObjectType) {
		// params = {
		// 	background: '#49ffd2',
		// 	color: 'blue',
		// 	threshold: 120
		// };
		if (icons) {
			const promises = icons.map((icon: string) => {
				return new Promise((resolve) => {
					potrace.trace(
						icon,
						params || {},
						function(err: Error | null, svg: string | NodeJS.ArrayBufferView) {
							if (err) throw err;
							fs.writeFileSync("src/icons/svgs/output.svg", svg);
							resolve(svg);
						}
					);
				});
			});
			return await Promise.all(promises);
		}
		return [];
	}
}

export default PngToSvgConverter;
