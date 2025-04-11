import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { action } = req.body as { action: string };

    // Simulate an API call or action
    if (action === "super-ecolo") {
      process.exit(0);
      return res.status(200).json({ message: "Action super écolo réussie !" });
    } else {
      return res.status(400).json({ error: "Action non reconnue." });
    }
  } else {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }
}