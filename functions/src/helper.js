class Helper {

    static supportedFontSpecs = {
        "eot": "font/eot",
        "ttf": "font/ttf",
        "svg": "image/svg+xml",
        "woff": "font/woff",
        "woff2": "font/woff2",
    };

    static supportedWeigts = [100, 300, 400, 500, 700, 900, 1100, "bold"]

    static supportedStyles = ["italic", "normal"]

    static getFontTypeFromAgent(userAgent) {
        if (userAgent.indexOf("(iPad)") > -1) {
            return "svg"
        } else if (userAgent.indexOf("MSIE") > -1) {
            return "eot";
        }
        const userAgentParts = userAgent.replaceAll(/\(.*?\) /g, "").split(" ");
        if (userAgentParts.length === 1 && userAgentParts[0].startsWith("Mozilla/")) {
            return "ttf";
        }
        const chromePart = userAgentParts.find(part => part.startsWith("Chrome"));
        const version = chromePart && +chromePart.split("/")[1].split(".")[0];
        if (version && !isNaN(version)) {
            return version < 40 ? "woff" : "woff2";
        }
        return "ttf";
    }

    static generateFont(name, config, params) {
        const formats = {
            svg: "svg", woff: "woff", woff2: "woff2", ttf: "truetype"
        }
        let {format, host, style, subset, weight} = params || {};
        style = style || "normal";
        weight = weight || 400;
        const formatAttribute = formats[format] ? ` format('${formats[format]}')` : ""
        let unicodeRange;
        if (subset && config && config.unicodeRange) {
            unicodeRange = config.unicodeRange[subset];
        }
        const encodedSpecs = Buffer.from(`${weight}:${style}`).toString('base64')
        const url = `${host}/api/static/f/${name.replace(/ /g, "+")}/${encodedSpecs}.${format}`;
        let fontBuilder = subset ? `/* ${subset} */\n` : "";
        fontBuilder += `@font-face {\n`;
        fontBuilder += `\tfont-family: '${name.replace(/\+/g, " ")}';\n`;
        fontBuilder += `\tfont-style: ${style};\n`;
        fontBuilder += `\tfont-weight: ${weight};\n`;
        fontBuilder += `\tsrc: url(${url})${formatAttribute ? formatAttribute : ""};\n`;
        unicodeRange && (fontBuilder += `\tunicode-range: ${unicodeRange};\n`);
        fontBuilder += "}\n";
        return fontBuilder;
    }

    static getFileNameAndContentTypeFromSpecs(family, specs) {
        const supportedFontSpecs = Helper.supportedFontSpecs;
        const fontFormats = Object.keys(supportedFontSpecs);
        let format,
            weight,
            style;
        if (specs) {
            let encodedPart;
            if (specs.indexOf(".") > -1) {
              format = specs.substring(specs.lastIndexOf(".") + 1);
              encodedPart = specs.substring(0, specs.lastIndexOf("."));
              !fontFormats.includes(format) && res.send("Unsupported font format" + format + ". Please use one of eot, ttf, svg, woff or woff2!");
            } else {
              format = "ttf";
              encodedPart = specs;
            }
            const decodedSpecs = Buffer.from(encodedPart, "base64").toString("ascii");
            const requestedFontSpecs = decodedSpecs.split(":");
            weight = requestedFontSpecs[0];
            weight = Helper.supportedWeigts.indexOf(weight) === -1 ? 400 : weight;
            style = requestedFontSpecs[1];
            style = Helper.supportedStyles.indexOf(style) === -1 ? "normal" : style;
        } else {
            weight = 400;
            style = "normal";
            format = "ttf";
        }
        family = family.replace(/ /g, "+");
        const fontFileName = `${family}_${weight}_${style}.${format}`;
        const contentType = Helper.supportedFontSpecs[format];
        return {fontFileName, contentType};
    }
}

export default Helper;