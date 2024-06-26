import { getOrCreateSurvey, updateSurveyResult } from "@/helpers/game";
import { ImageResponse } from "next/og";
import template from "../template.json";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  if (!address) {
    return new Response("Address not found", { status: 500 });
  }
  const survey = await getOrCreateSurvey(address);
  if (!survey) {
    return new Response("Survey not found", { status: 500 });
  }

  let result = 0;
  for (const answer of survey.answers) {
    result = result * 2 + answer;
  }
  result = result % template.results.length;

  if (survey.result === null) {
    await updateSurveyResult(address, result);
    await fetch(`https://nft-mint-server.vercel.app/api/sendTransaction?address=${address}&id=${result}`);
  }

  // const result = survey.answers.reduce((acc, answer) => acc * 2 + answer, 0) % template.results.length;

  try {
    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full justify-center items-center p-10 bg-white relative">
          <div tw="flex flex-col mb-16 h-full items-center overflow-hidden">
            <img
              tw="w-[580px] mt-[-1px]"
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/assets/result-${result + 1}.png`}
            />
          </div>
        </div>
      )
    );
  } catch (e: any) {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
