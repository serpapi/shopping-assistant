import 'dotenv/config'
import OpenAI from "openai";
import { getJson } from "serpapi";

const openai = new OpenAI();

const objectIdentificationResponse = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [
    {
      role: "system",
      content: `
        You're a helpful shopping assistant and Google expert, you help to identify an object from an image and compose a search query, include the brand name and specs whenever possible. 
        The search query must be searchable on Google Shopping (https://shopping.google.com/).
        You should return the final search query and nothing else. Thank you.
      `,
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcStIICmxNzsLgcU-ua7GnCDll8TPNEETpyzE3rdNtOQ8pWvmtbVD6aedqyVOPUiJKZt1fPwN02Tsu9LdCQMgy7P5sHasD4uOw&usqp=CAE",
          },
        },
      ],
    },
  ],
  temperature: 0.5,
});

const query = objectIdentificationResponse.choices[0]?.message?.content

const googleShoppingResponse = await getJson({
  engine: "google_shopping",
  api_key: process.env.SERPAPI_API_KEY,
  q: query,
});

const shoppingAnalysisResponse = await openai.chat.completions.create({
  model: "gpt-4-1106-preview",
  messages: [
    {
      role: "system",
      content: "You're a helpful shopping assistant in helping user finding the best deal. Give step-by-step walkthrough why you think it is the best deal",
    },
    {
      role: "user",
      content: `
        I am looking for the best deal from this list of items
        ${JSON.stringify(googleShoppingResponse.shopping_results)}
      `
    },
  ],
  temperature: 0.5,
});
console.log(shoppingAnalysisResponse.choices[0]);