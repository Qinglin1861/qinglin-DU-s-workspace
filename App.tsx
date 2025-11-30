import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import StudyPlanner from './components/StudyPlanner';
import WritingLab from './components/WritingLab';
import SpeakingCoach from './components/SpeakingCoach';
import { LayoutDashboard, Calendar, PenTool, Mic, GraduationCap, Menu, X } from 'lucide-react';

enum View {
  DASHBOARD = 'Dashboard',
  PLANNER = 'Study Plan',
  WRITING = 'Writing Lab',
  SPEAKING = 'Speaking Coach'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon }: { view: View; icon: React.ElementType }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        currentView === view
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{view}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">IELTS Master</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          <NavItem view={View.DASHBOARD} icon={LayoutDashboard} />
          <NavItem view={View.PLANNER} icon={Calendar} />
          <NavItem view={View.WRITING} icon={PenTool} />
          <NavItem view={View.SPEAKING} icon={Mic} />
        </nav>

        <div className="p-6 border-t border-slate-100">
           <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
             <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Status</p>
             <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               Full-Time Study
             </p>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-20 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
               <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">IELTS Master</span>
         </div>
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
           {mobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-10 pt-20 px-4 space-y-2">
          <NavItem view={View.DASHBOARD} icon={LayoutDashboard} />
          <NavItem view={View.PLANNER} icon={Calendar} />
          <NavItem view={View.WRITING} icon={PenTool} />
          <NavItem view={View.SPEAKING} icon={Mic} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col pt-16 md:pt-0">
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white/50 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-slate-800">{currentView}</h2>
          <div className="text-sm text-slate-500">
            Welcome back, Student
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === View.DASHBOARD && <Dashboard />}
            {currentView === View.PLANNER && <StudyPlanner />}
            {currentView === View.WRITING && <WritingLab />}
            {currentView === View.SPEAKING && <SpeakingCoach />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;