import React from 'react';
import { Card, Button } from './ui';
import { Download, Calendar, DollarSign, TrendingUp, TrendingDown, Users, Car, ArrowUpRight } from 'lucide-react';

export const OperatorReports: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif text-white">Business Intelligence</h2>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="gap-2"><Calendar size={14}/> This Month</Button>
             <Button variant="secondary" size="sm" className="gap-2"><Download size={14}/> Export CSV</Button>
          </div>
       </div>

       {/* Summary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/50 p-4">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                   <DollarSign size={20} />
                </div>
                <span className="text-xs text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded gap-1">
                   <TrendingUp size={10} /> +12%
                </span>
             </div>
             <p className="text-zinc-500 text-xs uppercase font-medium">Gross Revenue</p>
             <h3 className="text-2xl font-serif text-white mt-1">$145,290.00</h3>
          </Card>

          <Card className="bg-zinc-900/50 p-4">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                   <Car size={20} />
                </div>
                <span className="text-xs text-blue-500 flex items-center bg-blue-500/10 px-1.5 py-0.5 rounded gap-1">
                   <ArrowUpRight size={10} /> 854
                </span>
             </div>
             <p className="text-zinc-500 text-xs uppercase font-medium">Total Trips</p>
             <h3 className="text-2xl font-serif text-white mt-1">1,204</h3>
          </Card>

          <Card className="bg-zinc-900/50 p-4">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
                   <DollarSign size={20} />
                </div>
                <span className="text-xs text-zinc-500 flex items-center px-1.5 py-0.5 rounded gap-1">
                   Avg
                </span>
             </div>
             <p className="text-zinc-500 text-xs uppercase font-medium">Avg Ticket Size</p>
             <h3 className="text-2xl font-serif text-white mt-1">$120.67</h3>
          </Card>

          <Card className="bg-zinc-900/50 p-4">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                   <Users size={20} />
                </div>
                <span className="text-xs text-red-500 flex items-center bg-red-500/10 px-1.5 py-0.5 rounded gap-1">
                   <TrendingDown size={10} /> -2%
                </span>
             </div>
             <p className="text-zinc-500 text-xs uppercase font-medium">Driver Utilization</p>
             <h3 className="text-2xl font-serif text-white mt-1">78%</h3>
          </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Revenue Table */}
          <Card className="lg:col-span-2">
             <h3 className="text-lg font-medium text-white mb-4">Revenue Log</h3>
             <div className="overflow-hidden rounded-lg border border-zinc-800">
                <table className="w-full text-sm text-left">
                   <thead className="bg-zinc-950 text-zinc-400 font-medium">
                      <tr>
                         <th className="px-4 py-3">Booking ID</th>
                         <th className="px-4 py-3">Date</th>
                         <th className="px-4 py-3">Category</th>
                         <th className="px-4 py-3">Type</th>
                         <th className="px-4 py-3 text-right">Amount</th>
                         <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800 bg-zinc-900/30">
                      {[1,2,3,4,5].map((i) => (
                         <tr key={i} className="hover:bg-zinc-900 transition-colors">
                            <td className="px-4 py-3 font-mono text-zinc-300">BLK-928{i}</td>
                            <td className="px-4 py-3 text-zinc-400">Oct 2{i}, 2023</td>
                            <td className="px-4 py-3 text-white">SUV Luxury</td>
                            <td className="px-4 py-3 text-zinc-400">Hourly</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-medium">$450.00</td>
                            <td className="px-4 py-3 text-right text-xs"><span className="bg-green-500/10 text-green-500 px-2 py-1 rounded">Paid</span></td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </Card>

          {/* Top Performers */}
          <Card>
             <h3 className="text-lg font-medium text-white mb-4">Top Drivers</h3>
             <div className="space-y-4">
                {[
                  { name: 'James Doe', trips: 42, rating: 4.9, rev: '$5,200' },
                  { name: 'Sarah Smith', trips: 38, rating: 5.0, rev: '$4,800' },
                  { name: 'Michael B.', trips: 31, rating: 4.8, rev: '$3,900' },
                ].map((d, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                            {d.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-medium text-white">{d.name}</p>
                            <p className="text-xs text-zinc-500">{d.trips} Trips • {d.rating} ★</p>
                         </div>
                      </div>
                      <p className="text-sm font-mono text-emerald-400">{d.rev}</p>
                   </div>
                ))}
             </div>
             <Button variant="ghost" className="w-full mt-4 text-xs">View All Performance</Button>
          </Card>
       </div>
    </div>
  );
};