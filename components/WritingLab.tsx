import React, { useState } from 'react';
import { evaluateWriting } from '../services/geminiService';
import { WritingFeedback, WritingTaskType } from '../types';
import { PenTool, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const WritingLab: React.FC = () => {
  const [taskType, setTaskType] = useState<WritingTaskType>(WritingTaskType.TASK_2);
  const [topic, setTopic] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);

  const handleEvaluate = async () => {
    if (!topic || !essay) return;
    setLoading(true);
    setFeedback(null);
    try {
      const result = await evaluateWriting(topic, essay, taskType);
      setFeedback(result);
    } catch (e) {
      alert("Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreData = feedback ? [
    { name: 'Task Response', value: feedback.taskResponse },
    { name: 'Coherence', value: feedback.coherenceCohesion },
    { name: 'Lexical', value: feedback.lexicalResource },
    { name: 'Grammar', value: feedback.grammaticalRange },
  ] : [];

  const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
      {/* Input Section */}
      <div className="flex flex-col space-y-4 h-full">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              Writing Simulator
            </h2>
            <select 
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as WritingTaskType)}
              className="text-sm border border-slate-300 rounded-md p-1 outline-none focus:border-indigo-500"
            >
              <option value={WritingTaskType.TASK_1}>Task 1</option>
              <option value={WritingTaskType.TASK_2}>Task 2</option>
            </select>
          </div>

          <div className="space-y-3 flex-1 flex flex-col">
            <input
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="Paste your essay question/topic here..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <textarea
              className="w-full flex-1 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-serif text-slate-700 leading-relaxed"
              placeholder="Start writing your essay here. Focus on structure and vocabulary..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
            />
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
               <span>Word count: {essay.split(/\s+/).filter(w => w.length > 0).length}</span>
               <button 
                onClick={handleEvaluate}
                disabled={loading || !essay || !topic}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Evaluate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="flex flex-col h-full overflow-y-auto">
        {feedback ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Band {feedback.bandScore}</h3>
                <p className="text-slate-500 text-sm">Overall Score</p>
              </div>
              <div className="w-32 h-32">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={scoreData} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 uppercase block">Task Response</span>
                <span className="text-lg font-bold text-indigo-600">{feedback.taskResponse}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 uppercase block">Coherence</span>
                <span className="text-lg font-bold text-sky-500">{feedback.coherenceCohesion}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 uppercase block">Lexical</span>
                <span className="text-lg font-bold text-purple-500">{feedback.lexicalResource}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 uppercase block">Grammar</span>
                <span className="text-lg font-bold text-pink-500">{feedback.grammaticalRange}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Examiner Feedback
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {feedback.feedback}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Model Answer (Band 9 Rewrite)
              </h4>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line font-serif">
                {feedback.improvedVersion}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-center text-slate-400">
            <PenTool className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Submit your essay to get detailed AI feedback.</p>
            <p className="text-sm mt-2">We analyze according to official marking criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingLab;