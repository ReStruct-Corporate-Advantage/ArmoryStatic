import { ApiConfig } from "../types/apiconfig.interface";

const API_CONFIG: ApiConfig = {
  HOST: {
    development: "http://localhost:5000/api",
    production: "https://api.armco.tech",
  },
  STATIC_HOST: {
    development: "http://localhost:5001/api",
    production: "https://static.armco.tech",
  },
  TASKER: {
    development: "http://localhost:5002/api",
    production: "https://tasks.armco.tech",
  },
  CONFIG: {
    development: "http://localhost:5003/api",
    production: "https://config.armco.tech",
  },
  IAM: {
    development: "http://localhost:5004/api",
    production: "https://iam.armco.tech",
  },
  SEER: {
    development: "http://localhost:5005/api",
    production: "https://telemetry.armco.tech",
  },
};

export default API_CONFIG;
