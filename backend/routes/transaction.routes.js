import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple file-based storage (for demo purposes)
const STORAGE_FILE = path.join(__dirname, '../data/transactions.json');

/**
 * Ensure data directory exists
 */
const ensureDataDirectory = async () => {
  const dataDir = path.join(__dirname, '../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

/**
 * Load transactions from file
 */
const loadTransactions = async () => {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
};

/**
 * Save transactions to file
 */
const saveTransactions = async (transactions) => {
  await ensureDataDirectory();
  await fs.writeFile(STORAGE_FILE, JSON.stringify(transactions, null, 2));
};

/**
 * Get all transactions
 * GET /api/transactions
 */
router.get('/', async (req, res) => {
  try {
    const transactions = await loadTransactions();
    
    // Apply filters if provided
    const { status, paymentMethod, startDate, endDate } = req.query;
    
    let filtered = transactions;
    
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    
    if (paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === paymentMethod);
    }
    
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(endDate));
    }
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions',
      error: error.message
    });
  }
});

/**
 * Get transaction by ID
 * GET /api/transactions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await loadTransactions();
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction',
      error: error.message
    });
  }
});

/**
 * Create new transaction
 * POST /api/transactions
 */
router.post('/', async (req, res) => {
  try {
    const {
      orderId,
      amount,
      currency,
      paymentMethod,
      customerName,
      customerEmail,
      items,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, paymentMethod'
      });
    }
    
    const transactions = await loadTransactions();
    
    const newTransaction = {
      id: `TXN_${Date.now()}`,
      orderId,
      amount,
      currency: currency || 'VND',
      paymentMethod,
      customerName,
      customerEmail,
      items: items || [],
      metadata: metadata || {},
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    await saveTransactions(transactions);
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
});

/**
 * Update transaction status
 * PATCH /api/transactions/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentDetails } = req.body;
    
    const transactions = await loadTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Update transaction
    transactions[index] = {
      ...transactions[index],
      ...(status && { status }),
      ...(paymentDetails && { paymentDetails }),
      updatedAt: new Date().toISOString()
    };
    
    await saveTransactions(transactions);
    
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transactions[index]
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
      error: error.message
    });
  }
});

/**
 * Delete transaction
 * DELETE /api/transactions/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await loadTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    
    if (filtered.length === transactions.length) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    await saveTransactions(filtered);
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
      error: error.message
    });
  }
});

/**
 * Get transaction statistics
 * GET /api/transactions/stats/summary
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const transactions = await loadTransactions();
    
    const stats = {
      total: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      refunded: transactions.filter(t => t.status === 'refunded').length,
      totalAmount: transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      byPaymentMethod: {}
    };
    
    // Group by payment method
    transactions.forEach(t => {
      if (!stats.byPaymentMethod[t.paymentMethod]) {
        stats.byPaymentMethod[t.paymentMethod] = {
          count: 0,
          amount: 0
        };
      }
      stats.byPaymentMethod[t.paymentMethod].count++;
      if (t.status === 'completed') {
        stats.byPaymentMethod[t.paymentMethod].amount += t.amount;
      }
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

export default router;
