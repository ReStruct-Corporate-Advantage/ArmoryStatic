import { ObjectType } from "@armco/node-starter-kit/types/types";
import ReactDOMServer from "react-dom/server.js";

export function extractHostname(url: string) {
  let hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
}

// Warning: you can use this function to extract the "root" domain, but it will not be as accurate as using the psl package.

export function extractRootDomain(url: string) {
  let domain = extractHostname(url);
  const splitArr = domain.split("."),
    arrLen = splitArr.length;

  //extracting the root domain here
  //if there is a subdomain
  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + "." + splitArr[arrLen - 1];
    //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
    if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
      //this is using a ccTLD
      domain = splitArr[arrLen - 3] + "." + domain;
    }
  }
  return domain;
}

export function getRenderableSvgAsString(icons: any, source: string, name: string, props: any) {
  const iconSpace = icons[source as keyof object];
  const iconFunc = iconSpace[name as keyof object];
  const renderableIcon = iconFunc(props);
  return ReactDOMServer.renderToString(renderableIcon);
}

export function trimObject(obj: ObjectType, listToKeep?: Array<string> | null,
  listToTrim?: Array<string>) {
  let returnObj: ObjectType = {};
  if (!obj || (!listToTrim && !listToKeep)) {
    if (obj) {
      returnObj = JSON.parse(JSON.stringify(obj)) as ObjectType;
      Object.keys(returnObj).forEach((key: string) => {
        if (key.startsWith("_")) {
          delete returnObj[key];
        }
      });
      return returnObj;
    }
    return obj;
  }
  if (listToKeep) {
    listToKeep.forEach((key: string) => {
      returnObj[key] = obj[key];
    });
  } else {
    returnObj = JSON.parse(JSON.stringify(obj)) as ObjectType;
    listToTrim && Array.isArray(listToTrim) &&
      listToTrim.forEach((key: string) => {
        delete returnObj[key];
      });
  }
  Object.keys(returnObj).forEach((key: string) => {
    if (key.startsWith("_")) {
      delete returnObj[key];
    }
  });
  return returnObj;
}