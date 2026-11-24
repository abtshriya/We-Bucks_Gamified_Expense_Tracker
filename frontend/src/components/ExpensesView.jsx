import React, { useState } from 'react';
import TimeToEarnBadge from './TimeToEarnBadge';
import EmotionTag from './EmotionTag';
import { EMOTIONS } from '../constants/emotions';

const CATEGORIES = [
  { value: 'dining', label: 'Food & Dining' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'utilities', label: 'Bills & Utilities' },
  { value: 'transport', label: 'Transportation' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'other', label: 'Other' },
];

// expense ledger view and entry modal
export default function ExpensesView({
  expenses = [],
  settings,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddXp,
}) {
  const currency = settings?.currency_symbol || '₹';
  const wage = parseFloat(settings?.net_hourly_wage || 600);

  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'dining',
    emotional_state: 'content',
    description: '',
  });

  const modalAmount = parseFloat(formData.amount) || 0;
  const modalWorkHours = wage > 0 && modalAmount > 0
    ? (modalAmount / wage).toFixed(2)
    : '0.00';

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedEmotion && exp.emotional_state !== selectedEmotion) return false;
    if (selectedCategory && exp.category !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = exp.title?.toLowerCase().includes(term);
      const matchDesc = exp.description?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        title: expense.title,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        emotional_state: expense.emotional_state,
        description: expense.description || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        category: 'dining',
        emotional_state: 'content',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid title and amount.');
      return;
    }

    try {
      if (editingExpense) {
        await onUpdateExpense(editingExpense.id, formData);
      } else {
        await onCreateExpense(formData);
        if (onAddXp) onAddXp(50);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving expense:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await onDeleteExpense(id);
      } catch (err) {
        console.error('Error deleting expense:', err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="pixel-font mb-1" style={{ color: 'var(--olive)' }}>
            EXPENSE LEDGER
          </h4>
          <div style={{ fontSize: '1.05rem', color: 'var(--olive-light)' }}>
            Track what you buy, how you felt, and the hours of work it cost you (+50 XP).
          </div>
        </div>

        <button
          type="button"
          className="btn-pixel btn-pixel-primary"
          onClick={() => handleOpenModal(null)}
        >
          + LOG EXPENSE
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="pixel-box p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
            >
              <option value="">All Emotions</option>
              {Object.entries(EMOTIONS).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            {(selectedEmotion || selectedCategory || searchTerm) && (
              <button
                type="button"
                className="btn-pixel btn-pixel-light"
                style={{ fontSize: '0.55rem' }}
                onClick={() => {
                  setSelectedEmotion('');
                  setSelectedCategory('');
                  setSearchTerm('');
                }}
              >
                RESET
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="pixel-box p-0 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <p className="mb-2">No expenses found matching the selected filters.</p>
            <button
              type="button"
              className="btn-pixel btn-pixel-secondary"
              onClick={() => handleOpenModal(null)}
            >
              LOG AN EXPENSE
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-pixel">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>DATE</th>
                  <th>ITEM &amp; NOTES</th>
                  <th>CATEGORY</th>
                  <th>EMOTION</th>
                  <th>COST &amp; HOURS</th>
                  <th className="text-end" style={{ width: '120px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>
                      <div className="fw-bold">{exp.title}</div>
                      {exp.description && (
                        <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                          {exp.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="pixel-badge" style={{ backgroundColor: '#fff', color: '#000' }}>
                        {exp.category_display || exp.category}
                      </span>
                    </td>
                    <td>
                      <EmotionTag emotion={exp.emotional_state} />
                    </td>
                    <td>
                      <TimeToEarnBadge
                        amount={exp.amount}
                        hours={exp.hours_to_earn}
                        hourlyWage={wage}
                        currency={currency}
                      />
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn-pixel btn-pixel-light me-1"
                        style={{ fontSize: '0.55rem', padding: '0.25rem 0.45rem' }}
                        onClick={() => handleOpenModal(exp)}
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        className="btn-pixel btn-pixel-danger"
                        style={{ fontSize: '0.55rem', padding: '0.25rem 0.45rem' }}
                        onClick={() => handleDelete(exp.id, exp.title)}
                      >
                        DEL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pixel Modal for Create / Edit */}
      {isModalOpen && (
        <div className="pixel-modal-backdrop" onClick={handleCloseModal}>
          <div className="pixel-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-2 border-dark pb-2">
              <h5 className="pixel-font mb-0" style={{ color: 'var(--olive)' }}>
                {editingExpense ? 'EDIT ENTRY' : 'NEW LEDGER ENTRY'}
              </h5>
              <button
                type="button"
                className="btn-pixel btn-pixel-danger"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                onClick={handleCloseModal}
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                  ITEM TITLE
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Swiggy order, Blue Tokai, Metro recharge"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                    AMOUNT ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="form-control fw-bold"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="col-6">
                  <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                    DATE
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamic Time-to-Earn Preview Box */}
              <div
                className="p-2 px-3 border border-2 border-dark mb-3 d-flex align-items-center justify-content-between"
                style={{ backgroundColor: 'var(--sage-soft)' }}
              >
                <span className="pixel-font" style={{ fontSize: '0.6rem', color: 'var(--olive)' }}>
                  TIME-TO-EARN COST:
                </span>
                <span className="pixel-font fw-bold" style={{ fontSize: '0.72rem', color: 'var(--olive)' }}>
                  {modalWorkHours} WORK HOURS
                </span>
              </div>

              {/* Emotional State Selection */}
              <div className="mb-3">
                <label className="pixel-font small d-block mb-2" style={{ fontSize: '0.6rem' }}>
                  EMOTIONAL TRIGGER
                </label>
                <div className="d-flex flex-wrap gap-1">
                  {Object.entries(EMOTIONS).map(([key, info]) => {
                    const active = formData.emotional_state === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`btn-pixel ${active ? 'btn-pixel-primary' : 'btn-pixel-light'}`}
                        style={{ fontSize: '0.55rem', padding: '0.35rem 0.55rem' }}
                        onClick={() => setFormData({ ...formData, emotional_state: key })}
                      >
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                  CATEGORY
                </label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="pixel-font small d-block mb-1" style={{ fontSize: '0.6rem' }}>
                  EXPENSE NOTES (OPTIONAL)
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Context behind purchase..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 border-top border-2 border-dark pt-3">
                <button
                  type="button"
                  className="btn-pixel btn-pixel-light"
                  onClick={handleCloseModal}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-pixel btn-pixel-primary px-4"
                >
                  {editingExpense ? 'SAVE' : '+ LOG & GET 50 XP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
