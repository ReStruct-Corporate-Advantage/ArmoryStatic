import sharp from "sharp";

class PngResize {
  static async resize(iconPath: string, storePath: string) {
		return await sharp(iconPath)
			.png({palette: true})
			.resize({height: 224, width: 224})
			.toFile(`${storePath}${iconPath.substring(iconPath.lastIndexOf("/"))}`)
			// .then((info) => logger.info(JSON.stringify(info, null, 2)))
			.catch((err) => logger.error(err));
  }
}

export default PngResize;
