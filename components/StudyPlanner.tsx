import React, { useState } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { StudyPlan } from '../types';
import { Calendar, CheckCircle2, Loader2, Target, Download } from 'lucide-react';

const StudyPlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [days, setDays] = useState(14);
  const [weakness, setWeakness] = useState("Writing Task 2 and Speaking Fluency");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateStudyPlan(days, weakness);
      setPlan(result);
    } catch (e) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!plan) return;

    let content = `计划名称：西东Ada雅思考了10分\n`;
    content += `Duration: ${days} days\n`;
    content += `Focus Areas: ${weakness}\n`;
    content += `----------------------------------------\n\n`;

    plan.schedule.forEach((day) => {
      content += `Day ${day.day}: ${day.focus}\n`;
      day.tasks.forEach((task) => {
        content += `[ ] ${task}\n`;
      });
      content += `> Tip: ${day.tips}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `西东Ada雅思考了10分-${days}Days.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          计划名称：西东Ada雅思考了10分
        </h2>
        <p className="text-slate-600 mb-6">
          Since you have full-time availability, we will create an intensive schedule to maximize your score improvement.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Days until Exam</label>
            <input 
              type="number" 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              min="1" max="90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">My Weakest Areas</label>
            <input 
              type="text" 
              value={weakness} 
              onChange={(e) => setWeakness(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Listening, Writing Task 2..."
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
            Generate Personalized Plan
          </button>

          {plan && (
            <button 
              onClick={handleExport}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Download className="w-5 h-5" />
              Export Text File
            </button>
          )}
        </div>
      </div>

      {plan && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plan.schedule.map((day) => (
            <div key={day.day} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase">Day {day.day}</span>
                <span className="text-slate-500 text-sm font-medium">{day.focus}</span>
              </div>
              <ul className="space-y-2 mb-4">
                {day.tasks.map((task, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 italic">
                💡 Tip: {day.tips}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;