import { Request, Response, NextFunction } from 'express';

export const validateExpense = (req: Request, res: Response, next: NextFunction) => {
  const { category, amount, description, date } = req.body;

  if (!category || !amount || !description || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (amount < 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  next();
};

export const validateBudget = (req: Request, res: Response, next: NextFunction) => {
  const { category, amount, fiscalYear, quarter } = req.body;

  if (!category || !amount || !fiscalYear || !quarter) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (amount < 0) {
    return res.status(400).json({ error: 'Budget amount must be positive' });
  }

  if (quarter < 1 || quarter > 4) {
    return res.status(400).json({ error: 'Invalid quarter' });
  }

  next();
}; 