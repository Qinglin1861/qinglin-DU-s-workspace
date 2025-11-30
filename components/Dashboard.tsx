import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react';

const data = [
  { name: 'Mon', score: 6.0 },
  { name: 'Tue', score: 6.5 },
  { name: 'Wed', score: 6.0 },
  { name: 'Thu', score: 7.0 },
  { name: 'Fri', score: 7.0 },
  { name: 'Sat', score: 7.5 },
  { name: 'Sun', score: 7.5 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
               <Award className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-slate-500">Current Band</p>
               <h3 className="text-2xl font-bold text-slate-800">6.5</h3>
             </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
               <TrendingUp className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-slate-500">Target Band</p>
               <h3 className="text-2xl font-bold text-slate-800">8.0</h3>
             </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
               <BookOpen className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-slate-500">Essays Written</p>
               <h3 className="text-2xl font-bold text-slate-800">12</h3>
             </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
               <Clock className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-slate-500">Study Hours</p>
               <h3 className="text-2xl font-bold text-slate-800">48h</h3>
             </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Trend (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 9]} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
           <div>
             <h3 className="text-xl font-bold mb-2">Daily Motivation</h3>
             <p className="text-indigo-100 leading-relaxed opacity-90">
               "Success is the sum of small efforts, repeated day in and day out. You have the time, now put in the effort."
             </p>
           </div>
           <button className="mt-6 w-full py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
             Start Today's Tasks
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;