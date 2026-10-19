import React, { useState } from 'react';
import { NavigationMenuItem } from '../../types';
import { 
  Menu as MenuIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle,
  Save,
  RotateCcw
} from 'lucide-react';

interface MenuManagementSectionProps {
  menuItems?: NavigationMenuItem[];
  onUpdateMenu?: (items: NavigationMenuItem[]) => Promise<void> | void;
  onUpdateMenuItems?: (items: NavigationMenuItem[]) => Promise<void> | void;
  showFeedback?: (msg: string) => void;
}

export const MenuManagementSection: React.FC<MenuManagementSectionProps> = ({
  menuItems,
  onUpdateMenu,
  onUpdateMenuItems,
  showFeedback
}) => {
  const currentMenuItems = menuItems || [];
  const [items, setItems] = useState<NavigationMenuItem[]>(currentMenuItems);
  const [editingItem, setEditingItem] = useState<NavigationMenuItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: '',
    label: '',
    targetView: 'home',
    visible: true,
    order: 1,
    isExternal: false,
    externalUrl: '',
    badge: ''
  });

  const handleToggleVisibility = (id: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, visible: !it.visible } : it));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Reassign order
    const updated = copy.map((it, idx) => ({ ...it, order: idx + 1 }));
    setItems(updated);
  };

  const handleOpenAdd = () => {
    setIsNew(true);
    const newOrder = items.length + 1;
    setForm({
      id: `custom-menu-${Date.now()}`,
      label: '',
      targetView: 'home',
      visible: true,
      order: newOrder,
      isExternal: false,
      externalUrl: '',
      badge: ''
    });
    setEditingItem({
      id: `custom-menu-${Date.now()}`,
      label: '',
      targetView: 'home',
      visible: true,
      order: newOrder
    });
  };

  const handleOpenEdit = (item: NavigationMenuItem) => {
    setIsNew(false);
    setForm({
      id: item.id,
      label: item.label,
      targetView: item.targetView,
      visible: item.visible,
      order: item.order,
      isExternal: Boolean(item.isExternal),
      externalUrl: item.externalUrl || '',
      badge: item.badge || ''
    });
    setEditingItem(item);
  };

  const handleSaveModalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;

    const updatedItem: NavigationMenuItem = {
      id: form.id,
      label: form.label.trim(),
      targetView: form.targetView,
      visible: form.visible,
      order: form.order,
      isExternal: form.isExternal,
      externalUrl: form.externalUrl,
      badge: form.badge
    };

    if (isNew) {
      setItems(prev => [...prev, updatedItem].sort((a, b) => a.order - b.order));
    } else {
      setItems(prev => prev.map(it => it.id === updatedItem.id ? updatedItem : it));
    }

    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to remove the menu item "${label}"?`)) {
      setItems(prev => (prev || []).filter(it => it.id !== id).map((it, idx) => ({ ...it, order: idx + 1 })));
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      if (onUpdateMenu) await onUpdateMenu(items);
      if (onUpdateMenuItems) await onUpdateMenuItems(items);
      if (showFeedback) showFeedback('Navigation menu updated.');
      setSuccessMessage('Navigation menu bar updated across mobile, tablet, and desktop views.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset navigation menu items to default configuration?')) {
      const defaults: NavigationMenuItem[] = [
        { id: "home", label: "Home", targetView: "home", visible: true, order: 1 },
        { id: "executives", label: "Executives & People", targetView: "executives", visible: true, order: 2 },
        { id: "past-questions", label: "Past Questions", targetView: "past-questions", visible: true, order: 3 },
        { id: "events", label: "Events", targetView: "events", visible: true, order: 4 },
        { id: "gallery", label: "Gallery", targetView: "gallery", visible: true, order: 5 },
        { id: "constitution", label: "Constitution", targetView: "constitution", visible: true, order: 6 },
        { id: "awards", label: "Awards & Voting", targetView: "awards", visible: true, order: 7 },
        { id: "donate", label: "Donate", targetView: "donate", visible: true, order: 8 },
        { id: "contact", label: "Contact", targetView: "contact", visible: true, order: 9 }
      ];
      setItems(defaults);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <MenuIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Navigation & Menu Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize header navigation links, titles, ordering, and public visibility without editing website code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-[#1F5FAF] hover:bg-[#174983] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Menu items list table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Navigation Hierarchy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Use arrows to reorder how links display in the top navigation bar.</p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Deploy Menu'}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item, idx) => (
            <div 
              key={item.id} 
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                item.visible ? 'hover:bg-slate-50/70' : 'bg-slate-50/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  #{item.order}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-xs">{item.label}</p>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Target View: <code className="text-sky-700 font-mono">{item.targetView}</code>
                    {item.isExternal && <span className="ml-2 text-amber-600 font-semibold">• External: {item.externalUrl}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Reorder Buttons */}
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Visibility Toggle */}
                <button
                  onClick={() => handleToggleVisibility(item.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    item.visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={item.visible ? 'Visible in Navigation' : 'Hidden from Navigation'}
                >
                  {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Menu Item"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteItem(item.id, item.label)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Menu Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {isNew ? 'Add Navigation Link' : 'Edit Navigation Link'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set display label, target view screen, badge, and visibility.
            </p>

            <form onSubmit={handleSaveModalItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Menu Label *</label>
                <input
                  type="text"
                  required
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Past Questions"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target View Screen</label>
                <select
                  value={form.targetView}
                  onChange={e => setForm({ ...form, targetView: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="home">Home</option>
                  <option value="executives">Executive Council & People</option>
                  <option value="past-questions">Past Questions Bank</option>
                  <option value="events">Events Calendar</option>
                  <option value="gallery">Photo Archive</option>
                  <option value="constitution">Constitution</option>
                  <option value="awards">Awards & Voting</option>
                  <option value="donate">Support & Donate</option>
                  <option value="contact">Secretariat Contact</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Optional Badge Text</label>
                <input
                  type="text"
                  value={form.badge || ''}
                  onChange={e => setForm({ ...form, badge: e.target.value })}
                  placeholder="e.g. New, Live, Voting"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.visible}
                    onChange={e => setForm({ ...form, visible: e.target.checked })}
                    className="rounded text-sky-600 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Display in Navigation</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1F5FAF] hover:bg-[#174983] text-white font-bold rounded-xl shadow-xs"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
