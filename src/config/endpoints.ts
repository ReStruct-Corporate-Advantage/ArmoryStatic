const ENDPOINTS = {
	FILE: {
		ROOT: "/secure/file",
		GET: "/",
		RAW: "/raw",
		UPLOAD_IMAGE: "/image",
		UPLOAD_DOC: "/doc",
	},
	IAM: {
		ROOT: "/secure",
		USERS: {
			ROOT: "/users",
			FIND: "/find",
		},
	},
};

export default ENDPOINTS;