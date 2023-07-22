import {ref, uploadBytes, getBytes} from "firebase/storage";
import storage from "./index.js";
import fs from "fs";

function upload(fileName, file, space) {
  const fileWithLocationRef = ref(
    storage,
    `${space ? space + "/" : ""}${fileName}`
  );
  uploadBytes(fileWithLocationRef, file).then(() =>
    console.log("Uploaded a blob or file: ", fileName)
  );
}

function download(fileName, space) {
  const fileWithLocationRef = ref(
    storage,
    `${space ? space + "/" : ""}${fileName}`
  );
  return getBytes(fileWithLocationRef);
}

function initiateFontRepository() {
  fs.readdir("fonts/all", (error, files) => {
    for (let i = 0; i < files.length; i++) {
      console.log("Fetching file: ", files[i]);
      const file = fs.readFileSync(`all/${files[i]}`);
      console.log("Uploading file: ", files[i]);
      setTimeout(() => upload(files[i], file), 100);
    }
  });
}

export {upload, download, initiateFontRepository};
