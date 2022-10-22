import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const LOCAL_CACHE_FILE = join(__dirname, "descriptions.json");

export default async (request: VercelRequest, response: VercelResponse) => {
	response.setHeader(
		"Cache-Control",
		"max-age=0, s-maxage=604800" // 7 days in seconds
	);

	if (existsSync(LOCAL_CACHE_FILE)) {
		console.log("Using local cache");
		const fileData = readFileSync(join(__dirname, "descriptions.json"), "utf8");
		return response.json({ ...JSON.parse(fileData), cache: true });
	}

	const all_numbers = (await axios("https://api.voedingscentrum.nl/api/enumbertool/enumbers/")).data;

	const all_parsed: { enumber: string; id: string; data: any }[] = all_numbers.map((enumber: any) => {
		const [E, number, name] = enumber.FullName.split(" ", 3);
		return {
			enumber: E + number,
			id: enumber.Id,
			data: axios("https://api.voedingscentrum.nl/api/enumbertool/enumbers/" + enumber.Id),
		};
	});

	const res = await Promise.all(all_parsed.map((x) => x.data));
	all_parsed.forEach((x, i) => {
		const api_response = res[i].data;

		const new_data = {
			text: api_response.Text,
			applications: api_response.Applications.map((y: { Name: string }) => y.Name),
		};

		all_parsed[i].data = new_data;
	});

	response.status(200).json({
		ok: true,
		amount: all_parsed.length,
		data: all_parsed,
	});
};
