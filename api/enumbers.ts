import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Sample
   <tr><td>E1168</td><td>Vegan</td></tr>
  <tr><td>E101</td><td>Sometimes Vegan</td><td>Riboflavin or lactoflavin</td></tr>
*/

// Write a regex that matches the complete enumber and vegan text in the above sample.
// Also match the optional text in the sometimes vegan sample.
const regex = /<tr><td>(E.+?)<\/td><td>(.+?)<\/td>(<td>(.+?)<\/td>)?<\/tr>/;

export default async (request: VercelRequest, response: VercelResponse) => {
	const req = await axios("https://sarakidd.com/vegan-e-numbers-list/");
	const html_content = req.data as string;
	// Match the regex against the html content and get the groups

	const matches: { enumber: string; vegan: string; optional: string; group: string }[] = [];
	let currentTitle = "";

	html_content.split("\n").forEach((line) => {
		// Check if this line is a title:
		// <h2 style="padding-top:20px;"
		if (line.startsWith("<h2")) {
			// Get the title from the line
			const title = line.match(/.+?>(.+?)<\/h2>/)?.[1];
			currentTitle = title || "";
			console.log("new title", currentTitle);
		} else if (line.startsWith(" <tr>")) {
			const match = line.match(regex);
			console.log(line, match);
			if (match) {
				const [_, enumber, vegan, __, optional] = match;
				matches.push({ enumber, vegan, optional, group: currentTitle });
			}
		}
	});

	response.status(200).json({
		ok: true,
		enumbers: matches,
	});
};
