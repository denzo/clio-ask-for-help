import { DataAPIClient } from "@datastax/astra-db-ts";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT, OPENAI_API_KEY } = process.env;

type Params = {
  question: string;
};

export async function GET(request: Request, context: { params: Params }) {
  console.log(context);
  const url = new URL(request.url);
  const question = url.searchParams.get('question') || "default question if not provided";

  const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
  const db = client.db(ASTRA_DB_API_ENDPOINT!);
  const articles = db.collection("articles");

  const similarArticles = await articles
    .find(
      {},
      {
        vectorize: question,
        limit: 1,
      }
    )
    .toArray();

  if (similarArticles.length === 0) {
    return new Response("No articles found", { status: 404 });
  }

  const theArticle = similarArticles[0].data;
  console.log(theArticle);

  

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `My question: ${question}. Could you please answer my question based on this context: ${theArticle}. If you cannot find it in the context please reply "I don't know". Please include the URL for reference at the very end.`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log("OpenAI Response:", chatCompletion.choices[0].message.content);

  return new Response(JSON.stringify(chatCompletion.choices[0].message), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
