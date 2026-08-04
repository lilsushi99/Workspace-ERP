import { Expense, ExpenseFilters, ExpenseSummaryMetrics, ExpenseCategory } from '../../src/types';
import { executeQuery } from '../database/db';
import { auditRepository } from './auditRepository';

export class ExpenseRepository {
  // --- CATEGORIES MANAGEMENT ---
  public async getCategories(): Promise<ExpenseCategory[]> {
    try {
      const rows = await executeQuery<any>(
        `SELECT id, name, description, status, created_date as createdDate FROM expense_categories ORDER BY id ASC`
      );
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        status: (r.status || 'Active') as 'Active' | 'Inactive',
        createdDate: r.createdDate || new Date().toISOString().split('T')[0],
      }));
    } catch (err) {
      console.error('Error fetching expense categories:', err);
      return [];
    }
  }

  public async createCategory(data: { name: string; description?: string }): Promise<ExpenseCategory> {
    const categories = await this.getCategories();
    const newCat: ExpenseCategory = {
      id: `EC-00${categories.length + 1}`,
      name: data.name,
      description: data.description || '',
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0],
    };

    await executeQuery(
      `INSERT INTO expense_categories (id, name, description, status, created_date) VALUES (?, ?, ?, ?, ?)`,
      [newCat.id, newCat.name, newCat.description, newCat.status, newCat.createdDate]
    );

    auditRepository.logAction({
      user: 'System Admin',
      action: 'CREATE_EXPENSE_CATEGORY',
      entity: 'expense_categories',
      entityId: newCat.id,
      newValue: newCat,
    });

    return newCat;
  }

  public async updateCategory(id: string, updates: Partial<ExpenseCategory>): Promise<ExpenseCategory | null> {
    await executeQuery(
      `UPDATE expense_categories SET name = COALESCE(?, name), description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ?`,
      [updates.name || null, updates.description || null, updates.status || null, id]
    );

    const categories = await this.getCategories();
    const updated = categories.find((c) => c.id === id);
    if (updated) {
      auditRepository.logAction({
        user: 'System Admin',
        action: 'UPDATE_EXPENSE_CATEGORY',
        entity: 'expense_categories',
        entityId: id,
        newValue: updated,
      });
    }
    return updated || null;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.getCategories();
    const deleted = categories.find((c) => c.id === id);
    if (!deleted) return false;

    await executeQuery(`DELETE FROM expense_categories WHERE id = ?`, [id]);

    auditRepository.logAction({
      user: 'System Admin',
      action: 'DELETE_EXPENSE_CATEGORY',
      entity: 'expense_categories',
      entityId: id,
      previousValue: deleted,
    });

    return true;
  }

  // --- EXPENSE RECORDS MANAGEMENT ---
  public async getAllExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    try {
      const rows = await executeQuery<any>(
        `SELECT id, name, amount, date, branch, category, description, status, created_by as createdBy, created_at as createdAt FROM expenses ORDER BY date DESC`
      );

      let list: Expense[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        amount: Number(r.amount || 0),
        date: r.date ? String(r.date).substring(0, 10) : new Date().toISOString().substring(0, 10),
        branch: r.branch || 'Art & Tech Hub',
        category: r.category || 'Utilities',
        description: r.description || '',
        status: (r.status || 'Paid') as 'Paid' | 'Pending',
        createdBy: r.createdBy || 'Sarah Jenkins (Director)',
        createdAt: r.createdAt ? String(r.createdAt) : new Date().toISOString(),
      }));

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (e) =>
            e.id.toLowerCase().includes(q) ||
            e.name.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            (e.description && e.description.toLowerCase().includes(q)) ||
            (e.createdBy && e.createdBy.toLowerCase().includes(q))
        );
      }

      if (filters?.branch && filters.branch !== 'all') {
        const bLower = filters.branch.toLowerCase();
        list = list.filter((e) => {
          const eBranch = e.branch.toLowerCase();
          if (eBranch === bLower) return true;
          if (
            eBranch === 'both branches' &&
            (bLower === 'art & tech hub' || bLower === 'hive hub' || bLower === 'both branches')
          ) {
            return true;
          }
          return false;
        });
      }

      if (filters?.category && filters.category !== 'all') {
        list = list.filter((e) => e.category.toLowerCase() === filters.category!.toLowerCase());
      }

      if (filters?.dateFilter) {
        const todayStr = new Date().toISOString().substring(0, 10);
        const todayDate = new Date(todayStr);

        switch (filters.dateFilter) {
          case 'today':
            list = list.filter((e) => e.date === todayStr);
            break;
          case 'last_7_days': {
            const sevenDaysAgo = new Date(todayDate);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            list = list.filter((e) => {
              const d = new Date(e.date);
              return d >= sevenDaysAgo && d <= todayDate;
            });
            break;
          }
          case 'this_month': {
            const monthStr = todayStr.substring(0, 7);
            list = list.filter((e) => e.date.startsWith(monthStr));
            break;
          }
          case 'last_12_months': {
            const twelveMonthsAgo = new Date(todayDate);
            twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
            list = list.filter((e) => {
              const d = new Date(e.date);
              return d >= twelveMonthsAgo && d <= todayDate;
            });
            break;
          }
          case 'custom': {
            if (filters.startDate) {
              list = list.filter((e) => e.date >= filters.startDate!);
            }
            if (filters.endDate) {
              list = list.filter((e) => e.date <= filters.endDate!);
            }
            break;
          }
          default:
            if (filters.month && filters.month !== 'all') {
              list = list.filter((e) => e.date.startsWith(filters.month!));
            }
            break;
        }
      } else if (filters?.month && filters.month !== 'all') {
        list = list.filter((e) => e.date.startsWith(filters.month!));
      }

      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return list;
    } catch (err) {
      console.error('Error fetching expenses:', err);
      return [];
    }
  }

  public async getExpenseById(id: string): Promise<Expense | null> {
    const expenses = await this.getAllExpenses();
    return expenses.find((e) => e.id === id) || null;
  }

  public async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'createdBy' | 'status'> & { createdBy?: string }): Promise<Expense> {
    const all = await this.getAllExpenses();
    const count = all.length + 1;
    const year = new Date().getFullYear();
    const newId = `EXP-IPHIN-${year}-${count}`;

    const newExpense: Expense = {
      id: newId,
      name: data.name,
      amount: Number(data.amount),
      date: data.date,
      branch: data.branch,
      category: data.category || 'Utilities',
      description: data.description || '',
      status: 'Paid',
      createdBy: data.createdBy || 'Sarah Jenkins (Director)',
      createdAt: new Date().toISOString(),
    };

    await executeQuery(
      `INSERT INTO expenses (id, name, amount, date, branch, category, description, status, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newExpense.id,
        newExpense.name,
        newExpense.amount,
        newExpense.date,
        newExpense.branch,
        newExpense.category,
        newExpense.description,
        newExpense.status,
        newExpense.createdBy,
        newExpense.createdAt.replace('T', ' ').replace('Z', ''),
      ]
    );

    auditRepository.logAction({
      user: newExpense.createdBy,
      action: 'CREATE_EXPENSE',
      entity: 'expenses',
      entityId: newExpense.id,
      newValue: newExpense,
    });

    return newExpense;
  }

  public async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    await executeQuery(
      `UPDATE expenses SET name = COALESCE(?, name), amount = COALESCE(?, amount), category = COALESCE(?, category), branch = COALESCE(?, branch), description = COALESCE(?, description), date = COALESCE(?, date) WHERE id = ?`,
      [
        updates.name || null,
        updates.amount !== undefined ? Number(updates.amount) : null,
        updates.category || null,
        updates.branch || null,
        updates.description || null,
        updates.date || null,
        id,
      ]
    );

    const updated = await this.getExpenseById(id);
    if (updated) {
      auditRepository.logAction({
        user: 'System Admin',
        action: 'UPDATE_EXPENSE',
        entity: 'expenses',
        entityId: id,
        newValue: updated,
      });
    }
    return updated || null;
  }

  public async getSummaryMetrics(filters?: ExpenseFilters): Promise<ExpenseSummaryMetrics> {
    const todayExpensesList = await this.getAllExpenses({ ...filters, dateFilter: 'today' });
    const todaysExpenses = todayExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);

    const allList = await this.getAllExpenses({ branch: filters?.branch, category: filters?.category });
    const uniqueMonths = new Set(allList.map((e) => e.date.substring(0, 7)));
    const totalAllExpenses = allList.reduce((sum, e) => sum + Number(e.amount), 0);
    const monthCount = Math.max(1, uniqueMonths.size);
    const averageMonthlyExpenses = Math.round(totalAllExpenses / monthCount);

    const filteredList = await this.getAllExpenses(filters);
    const totalExpenses = filteredList.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      todaysExpenses,
      averageMonthlyExpenses,
      totalExpenses,
    };
  }
}
