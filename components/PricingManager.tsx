import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { VehicleCategory, PricingRule } from '../types';
import { Card, Button, Input } from './ui';
import { Edit2, Save, X, DollarSign } from 'lucide-react';

export const PricingManager: React.FC = () => {
  const { pricingRules, updatePricingRule } = useStore();
  const [editingCategory, setEditingCategory] = useState<VehicleCategory | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleEdit = (category: VehicleCategory) => {
    setEditingCategory(category);
    setEditForm({ ...pricingRules[category] });
  };

  const handleSave = () => {
    if (editingCategory) {
      updatePricingRule(editingCategory, {
        hourlyRate: parseFloat(editForm.hourlyRate),
        baseP2P: parseFloat(editForm.baseP2P),
        perKm: parseFloat(editForm.perKm),
        minHours: parseInt(editForm.minHours),
        driverCommissionPct: parseFloat(editForm.driverCommissionPct)
      });
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif text-white">Fleet Pricing Configuration</h2>
        <div className="text-sm text-zinc-400">All prices in USD</div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.values(pricingRules).map((rule: PricingRule) => {
          const isEditing = editingCategory === rule.vehicleCategory;

          return (
            <Card key={rule.vehicleCategory} className={`border-l-4 ${isEditing ? 'border-l-gold-500 bg-zinc-900' : 'border-l-zinc-700'}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg text-white">{rule.vehicleCategory}</h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}><X size={16} /></Button>
                    <Button size="sm" onClick={handleSave}><Save size={16} /> Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(rule.vehicleCategory)}>
                    <Edit2 size={16} className="mr-2" /> Edit Rates
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Hourly Rate */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase">Hourly Rate</label>
                  {isEditing ? (
                    <Input 
                      type="number" 
                      value={editForm.hourlyRate} 
                      onChange={e => setEditForm({...editForm, hourlyRate: e.target.value})} 
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-xl font-mono text-white">${rule.hourlyRate}</p>
                  )}
                </div>

                {/* Base P2P */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase">Base Fare (P2P)</label>
                  {isEditing ? (
                    <Input 
                      type="number" 
                      value={editForm.baseP2P} 
                      onChange={e => setEditForm({...editForm, baseP2P: e.target.value})} 
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-xl font-mono text-white">${rule.baseP2P}</p>
                  )}
                </div>

                {/* Per KM */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase">Rate / KM</label>
                  {isEditing ? (
                    <Input 
                      type="number" 
                      value={editForm.perKm} 
                      onChange={e => setEditForm({...editForm, perKm: e.target.value})} 
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-xl font-mono text-white">${rule.perKm}</p>
                  )}
                </div>

                 {/* Min Hours */}
                 <div>
                  <label className="text-xs text-zinc-500 uppercase">Min Hours</label>
                  {isEditing ? (
                    <Input 
                      type="number" 
                      value={editForm.minHours} 
                      onChange={e => setEditForm({...editForm, minHours: e.target.value})} 
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-xl font-mono text-white">{rule.minHours}h</p>
                  )}
                </div>

                {/* Commission */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase">Driver Split</label>
                  {isEditing ? (
                    <Input 
                      type="number" 
                      step="0.01"
                      value={editForm.driverCommissionPct} 
                      onChange={e => setEditForm({...editForm, driverCommissionPct: e.target.value})} 
                      className="mt-1 h-9"
                    />
                  ) : (
                    <p className="text-xl font-mono text-emerald-400">{(rule.driverCommissionPct * 100).toFixed(0)}%</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};