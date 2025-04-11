import { findRelevantContent } from "@/lib/ai/embedding";

const main = async () => {
  const result = await findRelevantContent(
    "what is the capital of the moon?",
    "b8931ee8-1a95-478f-b6a3-8a0b1d257743"
  );
  console.log(result);
};

main();

/*

{
  "limit": 500
}

{
    "limit": 500,
    "filter": {
      "must": [
        {
          "key": "userId",
          "match": { "value": "b8931ee8-1a95-478f-b6a3-8a0b1d257743" }
        }
      ]
    }
}
*/
