import sharp from "sharp";
import {IconResponse} from "..";

class SvgToPngConverter {
  static async convert(icon: IconResponse, color: string) {
		if (icon && icon.svg) {
			const iconBuffer = new Buffer(icon.svg);
      await sharp(iconBuffer, {density: 300})
        .png({palette: true})
        .toFile(`src/icons/pngs/${icon.group + "_" + icon.name + "-" + color}.png`)
        .then(function (info) {
          console.log(info);
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  }
}

export default SvgToPngConverter;
