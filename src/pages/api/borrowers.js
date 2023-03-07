let borrowers = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    const { account_address, borrowing_amount, interest_rate } = req.body;
    const borrower = { account_address : account_address, borrowing_amount:borrowing_amount, interest_rate: interest_rate};
    borrowers = [...borrowers, borrower];
    res.status(201).json({ message: "Borrower registered successfully" });
  } else if (req.method === "GET") {
    res.status(200).json(borrowers);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
