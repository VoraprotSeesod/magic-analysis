import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenAI, type GoogleGenAIOptions, type GenerateContentResponse } from '@google/genai';
import { POLYGON_API_KEY, GEMINI_API_KEY, MODEL } from '$env/static/private';

export async function POST({ request }: RequestEvent) {
	const { symbol } = await request.json();

	const urlLastPrice = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2020-10-05/2025-10-05?adjusted=true&sort=asc&limit=50000&apiKey=${POLYGON_API_KEY}`;
	const responseLastPrice = await fetch(urlLastPrice);
	const lastPriceJson = await responseLastPrice.json();
	const lastPrice = lastPriceJson.results[lastPriceJson.results.length - 1].c

	const urlRmi14 = `https://api.polygon.io/v1/indicators/rsi/${symbol}?timespan=day&adjusted=true&window=14&series_type=close&order=desc&limit=5000&apiKey=${POLYGON_API_KEY}`;
	const responseRmi14 = await fetch(urlRmi14);
	const rmiJson = await responseRmi14.json();
	const rmi_14 = rmiJson.results.values[rmiJson.results.values.length - 1].value;

	const urlNews = `https://api.polygon.io/v2/reference/news?ticker=${symbol}&order=desc&limit=3&sort=published_utc&apiKey=${POLYGON_API_KEY}`;
	const responseNews = await fetch(urlNews);
	const newsJson = await responseNews.json();
	const news = newsJson.results.map((n: any) => n.title).join(', ');

	const contents = [
		{
			"role": "user",
			"parts": [
				{
					"text": `คุณคือผู้เชี่ยวชาญการวิเคราะห์หุ้น โปรดวิเคราะห์หุ้น ${symbol} สำหรับนักลงทุนรายย่อยในไทย โดยใช้ข้อมูลต่อไปนี้:\n- ราคาล่าสุด: ${lastPrice.toFixed(2)} USD\n- RSI(14): ${rmi_14.toFixed(2)}\n- ข่าวล่าสุด: \" ${news}\"\n\nให้วิเคราะห์สั้นๆ ไม่เกิน 3 ย่อหน้า ในรูปแบบ Markdown โดยเน้นที่:\n1. สรุปภาพรวมทางเทคนิคสั้นๆ (Technical Outlook)\n2. ปัจจัยจากข่าวที่น่าสนใจ (News Factors)\n3. ข้อควรระวัง หรือโอกาสที่น่าจับตา (Key takeaway)\n\nใช้ภาษาไทยที่เข้าใจง่าย และ **ไม่ต้องมีประโยคเกริ่นนำ** ก่อนเริ่มบทวิเคราะห์`
				}
			]
		}
	]

	const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY } as GoogleGenAIOptions);
	const response: GenerateContentResponse = await ai.models.generateContent({
		model: MODEL,
		contents: contents,
	});
	return json({ contents: response.text }, { status: 200 });
}