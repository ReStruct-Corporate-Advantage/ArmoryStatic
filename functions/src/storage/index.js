import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {initiateFontRepository, upload, download} from "./controller.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvIFLjARjCP1j7ZOEyk6tChXSS3L8HDy0",
    authDomain: "armory-ui.firebaseapp.com",
    projectId: "armory-ui",
    storageBucket: "armory-ui.appspot.com",
    messagingSenderId: "891038830434",
    appId: "1:891038830434:web:6461b4977fd6d025d2663b"
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export {initiateFontRepository, upload, download};
export default storage;