import { ObjectType } from "@armco/node-starter-kit/types/types";

interface Formats {svg?: string, woff?: string, woff2?: string, ttf?: string, eot?: string}
class Helper {
    static supportedFontSpecs: Formats = {
        "eot": "font/eot",
        "ttf": "font/ttf",
        "svg": "image/svg+xml",
        "woff": "font/woff",
        "woff2": "font/woff2",
    };

    static supportedWeigts = [100, 300, 400, 500, 700, 900, 1100, "bold"];

    static supportedStyles = ["italic", "normal"];

    static getFontTypeFromAgent(userAgent: string) {
        if (userAgent.indexOf("(iPad)") > -1) {
            return "svg";
        } else if (userAgent.indexOf("MSIE") > -1) {
            return "eot";
        }
        const userAgentParts = userAgent.replace(/\(.*?\) /g, "").split(" ");
        if (userAgentParts.length === 1 && userAgentParts[0].startsWith("Mozilla/")) {
            return "ttf";
        }
        const chromePart = userAgentParts.find((part) => part.startsWith("Chrome"));
        const version = chromePart && +chromePart.split("/")[1].split(".")[0];
        if (version && !isNaN(version)) {
            return version < 40 ? "woff" : "woff2";
        }
        return "ttf";
    }

    static generateFont(name: string, config: ObjectType, params: ObjectType) {
        const formats: Formats = {
            svg: "svg", woff: "woff", woff2: "woff2", ttf: "truetype",
        };
        let {format, host, style, subset, weight} = params || {};
        style = style || "normal";
        weight = weight || 400;
        const formatAttribute = formats[format as keyof Formats] ? ` format('${formats[format as keyof Formats]}')` : "";
        let unicodeRange;
        if (subset && config && config.unicodeRange) {
            unicodeRange = (config.unicodeRange as ObjectType)[subset as keyof object];
        }
        const encodedSpecs = Buffer.from(`${weight}:${style}`).toString("base64");
        const url = `${host}/api/static/f/${name.replace(/ /g, "+")}/${encodedSpecs}.${format}`;
        let fontBuilder = subset ? `/* ${subset} */\n` : "";
        fontBuilder += "@font-face {\n";
        fontBuilder += `\tfont-family: '${name.replace(/\+/g, " ")}';\n`;
        fontBuilder += `\tfont-style: ${style};\n`;
        fontBuilder += `\tfont-weight: ${weight};\n`;
        fontBuilder += `\tsrc: url(${url})${formatAttribute ? formatAttribute : ""};\n`;
        unicodeRange && (fontBuilder += `\tunicode-range: ${unicodeRange};\n`);
        fontBuilder += "}\n";
        return fontBuilder;
    }

    static getFileNameAndContentTypeFromSpecs(family: string, specs: string) {
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
            //   !fontFormats.includes(format) && res.send("Unsupported font format" + format + ". Please use one of eot, ttf, svg, woff or woff2!");
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
        const contentType = Helper.supportedFontSpecs[format as keyof Formats];
        return {fontFileName, contentType};
    }

    static formatSizeFromLength(str: string) {
        const length = str.length;
        const bytes = length;
        const kilobytes = bytes / 1024;
        const megabytes = kilobytes / 1024;

        if (megabytes >= 1) {
            return `${megabytes.toFixed(2)} MB`;
        } else if (kilobytes >= 1) {
            return `${kilobytes.toFixed(2)} KB`;
        } else {
            return `${bytes} bytes`;
        }
    }

    static splitStringAtUpperCase(input: string): string[] {
        const result: string[] = [];
        let start = 0;
        for (let i = 1; i < input.length; i++) {
            if (input[i].toUpperCase() === input[i]) {
                result.push(input.substring(start, i));
                start = i;
            }
        }
        result.push(input.substring(start));
        return result;
    }
}

export default Helper;