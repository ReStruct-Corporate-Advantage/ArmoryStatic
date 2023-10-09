import fs from "fs";
import axios from "axios";
import { Request, Response } from "express";
import { Document } from "mongoose";
import ReactDOMServer from "react-dom/server.js";
import { getRenderableSvgAsString, trimObject } from "../helpers";
import Helper from "../helper";
import * as icons from "../icons/all";
import { IIcon, IIconMeta, IMeta, IconResponse } from "../models/Icon";
import { ITag } from "../models/Tag";
import { getAllIconsMeta, saveIcon, saveIconMeta, saveIcons, saveIconsMeta, saveTag } from "../dao/icon";
import { ObjectType } from "@armco/node-starter-kit/types/types";

// Set a custom timeout value (e.g., 5 seconds)
const CUSTOM_TIMEOUT = 10000; // 7 seconds in milliseconds
const MAGIC_BATCH_SIZE = 3000;
const ICON_ROOT_PATH = "src/icons/downloaded";
const ICON_ROOT_PATH_TNP = ICON_ROOT_PATH + "/tnp";
const ICON_ROOT_PATH_SR = ICON_ROOT_PATH + "/sr";
const TNP_URL = "https://static.thenounproject.com/png/";
const SITE_ROOT = "http://localhost:5003/static/";

const DISCARDED = [1024515, 1082311, 1084910, 1100311, 1087006, 1084910, 1087005, 1087004, 1080682,
	1075323, 1080681, 1076570, 1080353, 1078050, 1100347, 1080679, 1100309, 1075305, 1076569, 1076571, 1078051, 1100310, 1087007, 1100313,
	1075304, 1080680, 1078052, 1080678, 1075302, 1075303, 1100312, 1144247, 1428891, 1428911, 1428910, 1428909, 1428908, 1428906, 1428912,
	1428917, 1428918, 1428904, 1428920, 1428914, 1428922, 1428915, 1428913, 1428907, 1428919, 1428916, 1737700, 1737701, 1737697, 1835717,
	1835715, 1835720, 1835711, 1904273, 1904277, 1904281, 1904282, 1904270, 2002441, 2002448, 2002437, 2002445, 2002443, 2002444, 2002450,
	2002447, 2002451, 2002433, 2002434, 2002449, 2002446, 2126531, 2458565, 2461382, 2461383, 2461384, 2461385, 2461386, 2461387, 2461388,
	2461389, 2461390, 2461391, 2461392, 2461393, 2461394, 2461395, 2461396, 2461397, 2461398, 2461399, 2461400, 2461401, 2461402, 2461403,
	2461404, 2461405, 2461406, 2461407, 2461408, 2461409, 2461410, 2461411, 2461412, 2461413, 2461414, 2461415, 2461416, 2461417, 2461418,
	2461419, 2461420, 2461421, 2461422, 2461423, 2461424, 2461425, 2461426, 2461427, 2461428, 2461429, 2461430, 2461431, 2461432, 2461433,
	2461434, 2461435, 2461436, 2461437, 2461438, 2461439, 2461440, 2461441, 2461442, 2461443, 2461444, 2461445, 2461446, 2461447, 2461448,
	2461449, 2461450, 2461451, 2461452, 2461453, 2461454, 2461455, 2461456, 2461457, 2461458, 2461459, 2461460, 2461461, 2461462, 2461463,
	2461464, 2461465, 2461466, 2461467, 2461468, 2461469, 2461470, 2461471, 2461472, 2461473, 2461474, 2461475, 2461476, 2461477, 2461478,
	2461479, 2461480, 2461481, 2461482, 2461483, 2461484, 2461485, 2461486, 2461487, 2461488, 2461489, 2461490, 2461491, 2461492, 2461493,
	2461494, 2461495, 2461496, 2461497, 2461498, 2461499, 2461500, 2461501, 2461502, 2461503, 2461504, 2461505, 2461506, 2461507, 2461508,
	2461509, 2461510, 2461511, 2461512, 2461513, 2461514, 2461515, 2461516, 2461517, 2461518, 2461519, 2461520, 2461521, 2461522, 2461523,
	2461524, 2461525, 2461526, 2461527, 2461528, 2461529, 2461530, 2461531, 2461532, 2461533, 2461534, 2461535, 2461536, 2461537, 2461538,
	2461539, 2461540, 2461541, 2461542, 2461543, 2461544, 2461545, 2461546, 2461547, 2461548, 2461549, 2461550, 2461551, 2461552, 2461553,
	2461554, 2461555, 2461556, 2461557, 2461558, 2461559, 2461560, 2461561, 2461562, 2461563, 2461564, 2461565, 2461566, 2461567, 2461568,
	2461569, 2461570, 2461571, 2461572, 2461573, 2461574, 2461575, 2461576, 2461577, 2461578, 2461579, 2461580, 2461581, 2461582, 2461583,
	2461584, 2461585, 2461586, 2461587, 2461588, 2461589, 2461590, 2461591, 2461592, 2461593, 2461594, 2461595, 2461596, 2461597, 2461598,
	2461599, 2461600, 2461601, 2461602, 2461603, 2461604, 2461605, 2461606, 2461607, 2461608, 2461609, 2461610, 2461611, 2461612, 2461613,
	2461614, 2461615, 2461616, 2461617, 2461618, 2461619, 2461620, 2461621, 2461622, 2461623, 2461624, 2461625, 2461626, 2461627, 2461628,
	2461629, 2461630, 2461631, 2461632, 2461633, 2461634, 2461635, 2461636, 2461637, 2461638, 2461639, 2461640, 2461641, 2461642, 2461643,
	2461644, 2461645, 2461646, 2461647, 2461648, 2461649, 2461650, 2461651, 2461652, 2461653, 2461654, 2461655, 2461656, 2461657, 2461658,
	2461659, 2461660, 2461661, 2461662, 2461663, 2461664, 2461665, 2461666, 2461667, 2461668, 2461669, 2461670, 2461671, 2461672, 2461673,
	2461674, 2461675, 2461676, 2461677, 2461678, 2461679, 2461680, 2461681, 2461682, 2461683, 2461684, 2461685, 2461686, 2461687, 2461688,
	2461689, 2461690, 2461691, 2461692, 2461693, 2461694, 2461695, 2461696, 2461697, 2461698, 2461699, 2461700, 2461701, 2461702, 2461703,
	2461704, 2461705, 2461706, 2461707, 2461708, 2461709, 2461710, 2461711, 2461712, 2461713, 2461714, 2461715, 2461716, 2461717, 2461718,
	2461719, 2461720, 2461721, 2461722, 2461723, 2461724, 2461725, 2461726, 2461727, 2461728, 2461729, 2461730, 2461731, 2461732, 2461733,
	2461734, 2461735, 2461736, 2461737, 2461738, 2461739, 2461740, 2461741, 2461742, 2461743, 2461744, 2461745, 2461746, 2461747, 2461748,
	2461749, 2461750, 2461751, 2461752, 2461753, 2461754, 2461755, 2461756, 2461757, 2461758, 2461759, 2461760, 2461761, 2461762, 2461763,
	2461764, 2461765, 2461766, 2461767, 2461768, 2461769, 2461770, 2461771, 2461772, 2461773, 2461774, 2461775, 2461776, 2461777, 2461778,
	2461779, 2461780, 2461781, 2461782, 2461783, 2461784, 2461785, 2461786, 2461787, 2461788, 2461789, 2461790, 2461791, 2461792, 2461793,
	2461794, 2461795, 2461796, 2461797, 2461798, 2461799, 2461800, 2461801, 2461802, 2461803, 2461804, 2461805, 2461806, 2461807, 2461808,
	2461809, 2461810, 2461811, 2461812, 2461813, 2461814, 2461815, 2461816, 2461817, 2461818, 2461819, 2461820, 2461821, 2461822, 2461823,
	2461824, 2461825, 2461826, 2461827, 2461828, 2461829, 2461830, 2461831, 2461832, 2461833, 2461834, 2461835, 2461836, 2461837, 2461838,
	2461839, 2461840, 2461841, 2461842, 2461843, 2461844, 2461845, 2461846, 2461847, 2461848, 2461849, 2461850, 2461851, 2461852, 2461853,
	2461854, 2461855, 2461856, 2461857, 2461858, 2461859, 2461860, 2461861, 2461862, 2461863, 2461864, 2461865, 2461866, 2461867, 2461868,
	2461869, 2461870, 2461871, 2461872, 2461873, 2461874, 2461875, 2461876, 2461877, 2461878, 2461879, 2461880, 2461881, 2461882, 2461883,
	2461884, 2461885, 2461886, 2461887, 2461888, 2461889, 2461890, 2461891, 2461892, 2461893, 2461894, 2461895, 2461896, 2461897, 2461898,
	2461899, 2461900, 2461901, 2461902, 2461903, 2461904, 2461905, 2461906, 2461907, 2461908, 2461909, 2461910, 2461911, 2461912, 2461913,
	2461914, 2461915, 2461916, 2461917, 2461918, 2461919, 2461920, 2461921, 2461922, 2461923, 2461924, 2461925, 2461926, 2461927, 2461928,
	2461929, 2461930, 2461931, 2461932, 2461933, 2461934, 2461935, 2461936, 2461937, 2461938, 2461939, 2461940, 2461941, 2461942, 2461943,
	2461944, 2461945, 2461946, 2461947, 2461948, 2461949, 2461950, 2461951, 2461952, 2461953, 2461954, 2461955, 2461956, 2461957, 2461958,
	2461959, 2461960, 2461961, 2461962, 2461963, 2461964, 2461965, 2461966, 2461967, 2461968, 2461969, 2461970, 2461971, 2461972, 2461973,
	2461974, 2461975, 2461976, 2461977, 2461978, 2461979, 2461980, 2461981, 2461982, 2461983, 2461984, 2461985, 2461986, 2461987, 2461988,
	2461989, 2461990, 2461991, 2461992, 2461993, 2461994, 2461995, 2461996, 2461997, 2461998, 2461999, 2462000, 2462001, 2462002, 2462003,
	2462004, 2462005, 2462006, 2462007, 2462008, 2462009, 2462010, 2462011, 2462012, 2462013, 2462014, 2462015, 2462016, 2462017, 2462018,
	2462019, 2462020, 2462021, 2462022, 2462023, 2462024, 2462025, 2462026, 2462027, 2462028, 2462029, 2462030, 2462031, 2462032, 2462033,
	2462034, 2462035, 2462036, 2462037, 2462038, 2462039, 2462040, 2462041, 2462042, 2462043, 2462044, 2462045, 2462046, 2462047, 2462048,
	2462049, 2462050, 2462051, 2462052, 2462053, 2462054, 2462055, 2462056, 2462057, 2462058, 2462059, 2462060, 2462061, 2462062, 2462063,
	2462064, 2462065, 2462066, 2462067, 2462068, 2462069, 2462070, 2462071, 2462072, 2462073, 2462074, 2462075, 2462076, 2462077, 2462078,
	2462079, 2462080, 2462081, 2462082, 2462083, 2462084, 2462085, 2462086, 2462087, 2462088, 2462089, 2462090, 2462091, 2462092, 2462093,
	2462094, 2462095, 2462096, 2462097, 2462098, 2462099, 2462100, 2462101, 2462102, 2462103, 2462104, 2462105, 2462106, 2462107, 2462108,
	2462109, 2462110, 2462111, 2462112, 2462113, 2462114, 2462115, 2462116, 2462117, 2462118, 2462119, 2462120, 2462121, 2462122, 2462123,
	2462124, 2462125, 2462126, 2462127, 2462128, 2462129, 2462130, 2462131, 2462132, 2462133, 2462134, 2462135, 2462136, 2462137, 2462138,
	2462139, 2462140, 2462141, 2462142, 2462143, 2462144, 2462145, 2462146, 2462147, 2462148, 2462149, 2462150, 2462151, 2462152, 2462153,
	2462154, 2462155, 2462156, 2462157, 2462158, 2462159, 2462160, 2462161, 2462162, 2462163, 2462164, 2462165, 2462166, 2462167, 2462168,
	2462169, 2462170, 2462171, 2462172, 2462173, 2462174, 2462175, 2462176, 2462177, 2462178, 2462179, 2462180, 2462181, 2462182, 2462183,
	2462184, 2462185, 2462186, 2462187, 2462188, 2462189, 2462190, 2462191, 2462192, 2462193, 2462194, 2462195, 2462196, 2462197, 2462198,
	2462199, 2462200, 2462201, 2462202, 2462203, 2462204, 2462205, 2462206, 2462207, 2462208, 2462209, 2462210, 2462211, 2462212, 2462213,
	2462214, 2462215, 2462216, 2462217, 2462218, 2462219, 2462220, 2462221, 2462222, 2462223, 2462224, 2462225, 2462226, 2462227, 2462228,
	2462229, 2462230, 2462231, 2462232, 2462233, 2462234, 2462235, 2462236, 2462237, 2462238, 2462239, 2462240, 2462241, 2462242, 2462243,
	2462244, 2462245, 2462246, 2462247, 2462248, 2462249, 2462250, 2462251, 2462252, 2462253, 2462254, 2462255, 2462256, 2462257, 2462258,
	2462259, 2462260, 2462261, 2462262, 2462263, 2462264, 2462265, 2462266, 2462267, 2462268, 2462269, 2462270, 2462271, 2462272, 2462273,
	2462274, 2462275, 2462276, 2462277, 2462278, 2462279, 2462280, 2462281, 2462282, 2462283, 2462284, 2462285, 2462286, 2462287, 2462288,
	2462289, 2462290, 2462291, 2462292, 2462293, 2462294, 2462295, 2462296, 2462297, 2462298, 2462299, 2462300, 2462301, 2462302, 2462303,
	2462304, 2462305, 2462306, 2462307, 2462308, 2462309, 2462310, 2462311, 2462312, 2462313, 2462314, 2462315, 2462316, 2462317, 2462318,
	2462319, 2462320, 2462321, 2462322, 2462323, 2462324, 2462325, 2462326, 2462327, 2462328, 2462329, 2462330, 2462331, 2462332, 2462333,
	2462334, 2462335, 2462336, 2462337, 2462338, 2462339, 2462340, 2462341, 2462342, 2462343, 2462344, 2462345, 2462346, 2462347, 2462348,
	2462349, 2462350, 2462351, 2462352, 2462353, 2462354, 2462355, 2462356, 2462357, 2462358, 2462359, 2462360, 2462361, 2462362, 2462363,
	2462364, 2462365, 2462366, 2462367, 2462368, 2462369, 2462370, 2462371, 2462372, 2462373, 2462374, 2462375, 2462376, 2462377, 2462378,
	2462379, 2462380, 2462381, 2462382, 2462383, 2462384, 2462385, 2462386, 2462387, 2462388, 2462389, 2462390, 2462391, 2462392, 2462393,
	2462394, 2462395, 2462396, 2462397, 2462398, 2462399, 2462400, 2462401, 2462402, 2462403, 2462404, 2462405, 2462406, 2462407, 2462408,
	2462409, 2462410, 2462411, 2462412, 2462413, 2462414, 2462415, 2462416, 2462417, 2462418, 2462419, 2462420, 2462421, 2462422, 2462423,
	2462424, 2462425, 2462426, 2462427, 2462428, 2462429, 2462430, 2462431, 2462432, 2462433, 2462434, 2462435, 2462436, 2462437, 2462438,
	2462439, 2462440, 2462441, 2462442, 2462443, 2462444, 2462445, 2462446, 2462447, 2462448, 2462449, 2462450, 2462451, 2462452, 2462453,
	2462454, 2462455, 2462456, 2462457, 2462458, 2462459, 2462460, 2462461, 2462462, 2462463, 2462464, 2462465, 2462466, 2462467, 2462468,
	2462469, 2462470, 2462471, 2462472, 2462473, 2462474, 2462475, 2462476, 2462477, 2462478, 2462479, 2462480, 2462481, 2462482, 2462483,
	2462484, 2462485, 2462486, 2462487, 2462488, 2462489, 2462490, 2462491, 2462492, 2462493, 2462494, 2462495, 2462496, 2462497, 2462498,
	2462499, 2462500, 2462501, 2462502, 2462503, 2462504, 2462505, 2462506, 2462507, 2462508, 2462509, 2462510, 2462511, 2462512, 2462513,
	2462514, 2462515, 2462516, 2462517, 2462518, 2462519, 2462520, 2462521, 2462522, 2462523, 2462524, 2462525, 2462526, 2462527, 2462528,
	2462529, 2462530, 2462531, 2462532, 2462533, 2462534, 2462535, 2462536, 2462537, 2462538, 2462539, 2462540, 2462541, 2462542, 2462543,
	4108049, 5693948,
];

// Create an Axios instance with the custom timeout
const axiosInstance = axios.create({
	timeout: CUSTOM_TIMEOUT,
});

export function getIcon(req: Request, res: Response) {
	const { source, name, ...props } = req.params;
	try {
		const renderableIconAsString = getRenderableSvgAsString(icons, source, name, props);
		res.set("Content-Type", "image/svg+xml");
		res.send(renderableIconAsString);
	} catch (error) {
    // Handle errors here (e.g., file not found)
    console.error(error);
    res.status(404).send("Unable to fetch image");
  }
}

export async function getIcons(req: Request, res: Response) {
	const source = req.params.src;

	res.set("Content-Type", "image/png");
	res.status(200).json();
}

export async function getIconClusters(req: Request, res: Response) {
	try {
		const intermediate = await axios.get("http://localhost:5000/api/clusters");
		const intermediateClusters = intermediate.data;
		const clusterResponse: Array<Array<unknown>> = [];
		for (const cluster of Object.values(intermediateClusters)) {
			const currentClusterResponse: Array<unknown> = [];
			clusterResponse.push(currentClusterResponse);
			for (const path of (cluster as Array<string>)) {
				currentClusterResponse.push(SITE_ROOT + path);
			}
		}
		return res.status(200).json(clusterResponse);
	} catch (e) {
		return res.status(500).json({error: JSON.stringify(e)});
	}
}

export async function getAllIcons(req: Request, res: Response) {
	const iconsMeta = await getAllIconsMeta();
	const normalizedIconsMeta: { [key: string]: ObjectType } = {};
	iconsMeta && iconsMeta.forEach((iconMeta: Document) => {
		const jsonMeta = iconMeta.toJSON();
		normalizedIconsMeta[jsonMeta.name] = trimObject(jsonMeta);
	});
	const iconsRenders = Object.keys(icons).reduce((acc: Array<IconResponse>, group: string) => {
		const sourceObj = icons[group as keyof object];
		return acc.concat(
			Object.keys(sourceObj).map((name: string) => {
				const CompFunc: Function = sourceObj[name];
				return {
					name,
					group,
					svg: ReactDOMServer.renderToString(
						CompFunc && typeof CompFunc === "function" && CompFunc(req.params)
					),
					...normalizedIconsMeta[name],
				} as IconResponse;
			})
		);
	}, [] as Array<IconResponse>);
	res.send(iconsRenders);
}

export function incorrectUrlFormathandler(req: Request, res: Response) {
	res.send(
		"Use URL in the format /icon/{category}/{icon}/{optional_color>/{optional_size}/{optional_class}"
	);
}
/**
 * Risky operation DO NOT USER without review,
 * potential to override existing data, if any updates exist, they will be overriden with
 * icons from local copy
 *
 * @param req
 * @param res
 */
export function populateToDb(req: Request, res: Response) {
	const svgs: Array<IIcon> = [], metas: Array<IIconMeta> = [];
	const promises: Array<Promise<unknown>> = [];
	try {
		Object.keys(icons).forEach((group: string) => {
			const sourceObj = icons[group as keyof object];
			Object.keys(sourceObj).forEach((name: string) => {
				const CompFunc: Function = sourceObj[name];
				const icon = ReactDOMServer.renderToString(CompFunc && typeof CompFunc === "function" && CompFunc(req.params));
				const iconSize = Helper.formatSizeFromLength(icon);
				svgs.push({
					name,
					icon,
					createdby: "Armco",
				});
				metas.push({
					name,
					group,
					tags: [{ name: group, state: "verified" }, { name: "icon", state: "verified" }, { name: "armco", state: "verified" }] as Array<ITag>,
					meta: { size: iconSize, downloadTimes: 0, favoriteTimes: 0 } as IMeta,
					createdby: "Armco",
				});
			});
		});
		if (svgs.length > 0) {
			promises.push(saveIcons(svgs));
		}
		if (metas.length > 0) {
			promises.push(saveIconsMeta(metas));
		}
		Promise.all(promises)
			.then((resolutions) => {
				console.log(resolutions);
				res.status(200).json({ success: true });
			});
	} catch (e) {
		res.status(500).json({ success: false });
	}
}

export async function addIcon(req: Request, res: Response) {
	try {
		const promises = [];
		const icon = { name: req.body.name, icon: req.body.content } as IIcon;
		if ("decoded" in req && req.decoded) {
			icon.createdby = (req.decoded as ObjectType).email as string;
		}
		const iconMeta = { name: req.body.name, group: "external", tags: [{ name: "community" }] } as IIconMeta;
		if ("decoded" in req && req.decoded) {
			iconMeta.createdby = (req.decoded as ObjectType).email as string;
		}
		promises.push(saveIcon(icon as IIcon));
		promises.push(saveIconMeta(iconMeta as IIconMeta));
		return Promise.all(promises)
			.then((resolutions) => {
				return res.status(200).json({ success: true, response: resolutions });
			});
	} catch (e) {
		logger.error(e);
		return res.status(500).json({ success: false, message: "Something unexpected occurred!" });
	}
}

export async function addTag(req: Request, res: Response) {
	try {
		const response = await saveTag(req.body);
		return res.status(200).json({ success: true, response });
	} catch (e) {
		logger.error(e);
		return res.status(500).json({ success: false, message: "Something unexpected occurred!" });
	}
}

function generatePaths(parentDir: string, dirNames: Array<string>) {
	const paths: Array<{ path: string, from: number, to: number }> = [];
	let prevPath: { path: string, from: number, to: number };
	dirNames.forEach((dirName) => {
		if (prevPath) {
			prevPath.to = (+dirName) - 1;
		}
		prevPath = { path: parentDir + "/" + dirName, from: +dirName, to: 0 };
		paths.push(prevPath);
	});
	paths.forEach((path) => {
		if (path.to === 0) {
			path.to = path.from + MAGIC_BATCH_SIZE - 1;
		}
	});
	return paths;
}

function genMissing(missing: Array<number>, directories: Array<string | number>) {
	directories = directories.map((directory) => {
		try {
			return +directory;
		} catch (e) {
			logger.error(e);
		}
		return 0;
	}).filter((directory) => !!directory);
	const urls = missing.map((fileName: number) => {
		const nextDirIndex = directories.sort().findIndex((directory) => (directory as number) > fileName);
		const directory = directories[nextDirIndex - 1];
		if (directory) {
			let filePath = ICON_ROOT_PATH_TNP + "/" + directory;
			filePath += "/" + fileName + ".png";
			return { url: TNP_URL + fileName + "-200.png", filePath };
		}
		return { url: "", filePath: "" };
	}).filter((url) => !!url.url);
	fetchAndSave(urls);
}

export function findAndAttemptGenMissing(req: Request, res: Response) {
	const checkTill = req.body.till;
	const checkFrom = req.body.from;
	const keepShort = req.body.keepShort;
	const skipApi = req.body.skipApi;
	const parentDir = ICON_ROOT_PATH_TNP;
	const subDirs = fs.readdirSync(parentDir);
	const dirPaths = generatePaths(parentDir, subDirs.filter((subDir) =>
		+subDir >= (checkFrom || 1000000) &&
		+subDir <= (checkTill || Number.MAX_VALUE) &&
		!subDir.startsWith(".")));
	let total = 0;
	const dirTotals: { [key: number]: number } = {};
	const missingFiles: Array<number> = [];
	const dirMissingFiles: { [key: number]: Array<number> } = {};
	const dirMissingCount: { [key: number]: number } = {};
	dirPaths.forEach(({ path, from, to }) => {
		try {
			let files = fs.readdirSync(path);
			files = files.filter((file) => !file.startsWith("."));
			total += files.length;
			dirTotals[from] = files.length;
			let currentMissingCount = 0;
			const currentMissing = [];
			for (let i = from; i <= to; i++) {
				if (DISCARDED.indexOf(i) === -1 && files.indexOf(i + ".png") === -1) {
					missingFiles.push(i);
					currentMissing.push(i);
					currentMissingCount++;
				}
			}
			dirMissingFiles[from] = currentMissing;
			dirMissingCount[from] = currentMissingCount;
		} catch (e) {
			logger.error("Failed to read from: ", path);
		}
	});
	!skipApi && genMissing(missingFiles, subDirs);
	Object.keys(dirMissingCount).map((key) => +key).forEach((key: number) =>
		!dirMissingCount[key] && delete dirMissingCount[key]);
	// Object.keys(dirTotals).map((key) => +key).forEach((key: number) =>
	// 	dirTotals[key] === 3000 && delete dirTotals[key]);
	return res.json(keepShort ?
		{ missingCount: missingFiles.length, missingFiles, total } :
		// {missingCount: missingFiles.length, total, dirTotals, dirMissingCount, dirMissingFiles, missingFiles});
		{ missingCount: missingFiles.length, total, dirMissingCount, dirTotals, missingFiles });
}

export async function genMore(req: Request, res: Response) {
	// const init = 1000000;
	// const final = 6030778;
	const from = 1060001;
	const to = 1063000;
	await genBulk(from, to);
	return res.status(200).json({ success: true, from, to });
}

export async function genDirectories(_: Request, res: Response) {
	const parent = ICON_ROOT_PATH_TNP;
	let existing = 1507001;
	const final = 6030778;
	const directories: Array<string> = [];
	while (existing < final) {
		existing += MAGIC_BATCH_SIZE;
		directories.push("" + existing);
	}
	directories.forEach((directory) => {
		fs.mkdir(parent + "/" + directory, (status) => {
			console.log(status);
		});
	});
	return res.json({ success: true, created: directories.length });
}

export async function genBulk(from: number, to: number, src?: string) {
	if (from > 6030778) {
		logger.info("Done! Returning!");
		return;
	}
	if (to > 6030778) {
		logger.info("Updating to count to valid available!");
		to = 6030778;
	}
	logger.info("Fetching from: " + from + ", and to: " + to);
	// default to TNP path, for current code to work with minimal changes
	let rootPath = src && src === "sr" ? ICON_ROOT_PATH_SR : ICON_ROOT_PATH_TNP;
	const urls = [];
	rootPath += "/" + from;
	while (from <= to) {
		const filePath = `${rootPath}/${from}.png`;
		const url = TNP_URL + from + "-200.png";
		urls.push({ url, filePath });
		from++;
	}
	await fetchAndSave(urls);
	await delay(15000);
	genBulk(from, to + MAGIC_BATCH_SIZE); // from already increased
}

export async function fetchAndSave(urls: Array<{ url: string, filePath: string }>) {
	const promises = [];
	for (const { url, filePath } of urls) {
		promises.push(axiosInstance.get(url, { responseType: "stream" })
			.then((response) => {
				const writeStream = fs.createWriteStream(filePath);
				response.data.pipe(writeStream);
				return "API completed: " + url;
			})
			.catch((e) => {
				logger.error("Failed: ", url);
			}));
	}
	await Promise.all(promises);
}

export async function genMoreByCount(req: Request, res: Response) {
	const { from, to, src } = req.body;
	await genBulk(from, to, src);
	return res.json({ success: true, from, to });
}

function delay(time?: number) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			// Perform your operation here, for example, resolve with a result
			resolve("Operation completed successfully after 2 seconds");
		}, time || 2000); // 2-second timeout
	});
}
