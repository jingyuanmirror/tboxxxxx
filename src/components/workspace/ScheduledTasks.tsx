'use client';

import React, { useState } from 'react';
import {
  Settings,
  Plus,
  ChevronsLeft,
  ArrowRight,
  Zap,
  PenTool,
  Clock,
  Pause,
  Play,
  Trash2,
  X,
  Palette,
  Check,
  BarChart2,
  ChevronRight
} from 'lucide-react';

const FREQUENCY_OPTIONS = ['单次执行', '每天', '每周', '每月'];
const STYLE_OPTIONS = ['严肃专业', '幽默风趣', '小红书风', 'Twitter短推文', '学术严谨'];
const DOCUMENT_FORM_OPTIONS = ['纯文本摘要', 'Markdown表格', '周报邮件格式', 'PPT大纲'];
const REFERENCE_TEMPLATE_OPTIONS = ['麦肯锡市场分析报告', 'Q3 季度复盘文档', 'SWOT 分析框架', '产品 PR 新闻通稿', '用户调研访谈总结'];

function Icon({ comp: Comp, size = 18, className = '' }: any) {
  return <Comp size={size} className={className} />;
}

function QuickTrackerHero({ onAdd }: any) {
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [inputVal, setInputVal] = useState('');

  const handleAdd = () => {
    if (!inputVal.trim()) return;
    onAdd(inputVal, scheduleTime);
    setInputVal('');
  };

  const handleTimeClick = () => {
    const newTime = prompt('请输入新的每日发送时间 (HH:MM 格式，例如 09:30):', scheduleTime);
    if (newTime && /^([01]\d|2[0-3]):([0-5]\d)$/.test(newTime)) {
      setScheduleTime(newTime);
    } else if (newTime !== null) {
      alert('时间格式不正确，请使用 HH:MM 格式。');
    }
  };

  return (
    <div className="mb-12">
      <div className="text-sm text-gray-500 mb-2">周六, 12:47 PM</div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Hi Lisa，你希望我定时为你做什么？</h1>

      <div className="bg-[#f3f4f6] rounded-3xl p-4 relative flex items-center mt-8 mb-3">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="例如：'追踪新能源汽车行业动态'..."
          className="w-full bg-transparent border-none outline-none text-lg p-4 placeholder-gray-400 text-gray-800"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="bg-black hover:bg-gray-800 text-white p-3 rounded-full absolute right-4"><Icon comp={ArrowRight} size={20} /></button>
      </div>

      <p className="text-sm text-gray-500 ml-4">
        告诉我你想追踪的主题，我会在每日
        <span className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer mx-1 underline" onClick={handleTimeClick}>{scheduleTime}</span>
        为你发送信息。
      </p>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete }: any) {
  const isQuick = task.type === 'quick';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isQuick ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-800'}`}>
          <Icon comp={isQuick ? Zap : PenTool} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-gray-900">{task.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${task.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{task.status === 'active' ? '运行中' : '已暂停'}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Icon comp={Clock} size={14} /> {task.nextRun}</span>
            <span className="flex items-center gap-1">{task.styleOrRef}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onToggle} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"><Icon comp={task.status === 'active' ? Pause : Play} /></button>
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Icon comp={Trash2} /></button>
      </div>
    </div>
  );
}

function CustomTaskModal({ onClose, onSubmit }: any) {
  const [mode, setMode] = useState('style');
  const [formData, setFormData] = useState<any>({
    name: '',
    prompt: '',
    style: STYLE_OPTIONS[0],
    documentForm: DOCUMENT_FORM_OPTIONS[0],
    refTemplate: REFERENCE_TEMPLATE_OPTIONS[0],
    frequency: '每天',
    time: '17:00'
  });

  const inputStyle = "w-full rounded-xl border-gray-200 bg-[#f3f4f6] p-3.5 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all text-gray-800";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionTitleStyle = "font-bold text-gray-900 flex items-center gap-2 mb-4";

  const handleSubmit = () => {
    if(!formData.name) return alert('请输入任务名称');
    const finalData = {
      ...formData,
      mode,
      finalStyle: mode === 'style' ? formData.style : '使用参考模版',
      finalTemplate: mode === 'style' ? formData.documentForm : formData.refTemplate
    };
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">新建高级任务</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"><Icon comp={X} /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-8 no-scrollbar">
          <div className="space-y-5">
            <div>
              <input type="text" className={`${inputStyle} text-lg font-medium placeholder-gray-400 bg-white border-transparent focus:bg-white focus:border-gray-200`} placeholder="例如：周五科技新闻汇总" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>写作指令 (Prompt)</label>
              <textarea rows={3} className={`${inputStyle} resize-none`} placeholder="详细描述需要生成的内容..." value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} />
            </div>
          </div>
          <hr className="border-gray-100" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className={sectionTitleStyle}><Icon comp={Palette} /> 风格模版</h3>
              </div>
              <div className="flex gap-3 mb-2">
                <button onClick={() => setMode('style')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === 'style' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>写作风格</button>
                <button onClick={() => setMode('reference')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === 'reference' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>参考模版</button>
              </div>
              {mode === 'style' ? (
                <div className="space-y-4">
                  <div>
                    <select className={inputStyle} value={formData.style} onChange={e => setFormData({...formData, style: e.target.value})}>{STYLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                  </div>
                  <div>
                    <label className={labelStyle}>文档形式</label>
                    <select className={inputStyle} value={formData.documentForm} onChange={e => setFormData({...formData, documentForm: e.target.value})}>{DOCUMENT_FORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>选择预置模版</label>
                    <select className={inputStyle} value={formData.refTemplate} onChange={e => setFormData({...formData, refTemplate: e.target.value})}>{REFERENCE_TEMPLATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                    <p className="text-xs text-gray-400 mt-2 ml-1">* 参考模版已包含特定的格式规范，无需再次选择输出模版。</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-5">
              <h3 className={sectionTitleStyle}><Icon comp={Clock} /> 发送时间</h3>
              <div>
                <label className={labelStyle}>执行频率</label>
                <select className={inputStyle} value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>{FREQUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
              </div>
              <div>
                <label className={labelStyle}>发送时间</label>
                <div className="relative">
                  <input type="time" className={inputStyle} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  <div className="absolute right-4 top-4 text-gray-400 pointer-events-none"><Icon comp={Clock} size={16} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 border-t border-gray-100 flex justify-end gap-4 rounded-b-3xl bg-white">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">取消</button>
          <button onClick={handleSubmit} className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-transform active:scale-95 flex items-center gap-2 shadow-lg shadow-gray-200"><Icon comp={Check} /> 保存任务</button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduledTasks() {
  const [tasks, setTasks] = useState<any[]>([
    { id: 1, name: '竞品动态追踪日报', type: 'quick', status: 'active', nextRun: '明天 09:00', lastResult: '已发送', styleOrRef: '每日摘要' },
    { id: 2, name: '周五项目进度汇报', type: 'custom', status: 'paused', nextRun: '周五 16:00', lastResult: '等待执行', styleOrRef: 'PPT大纲' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addQuickTask = (keyword: string, scheduleTime: string) => {
    setTasks([{ id: Date.now(), name: `追踪：${keyword}`, type: 'quick', status: 'active', nextRun: `每日 ${scheduleTime}`, lastResult: '初始化', styleOrRef: '智能摘要' }, ...tasks]);
    alert('任务已建立');
  };

  const addCustomTask = (data: any) => {
    const displayStyle = data.mode === 'style' ? data.finalTemplate : data.finalTemplate;
    setTasks([{ id: Date.now(), name: data.name, type: 'custom', status: 'active', nextRun: `${data.frequency} ${data.time}`, lastResult: '等待执行', styleOrRef: displayStyle }, ...tasks]);
    setIsModalOpen(false);
  };

  const toggleStatus = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'paused' : 'active' } : t));
  const deleteTask = (id: number) => confirm('确认删除?') && setTasks(tasks.filter(t => t.id !== id));

  return (
    <div className="w-full">
      <QuickTrackerHero onAdd={addQuickTask} />

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 px-5 py-2.5 rounded-full font-medium transition-colors text-sm"><Icon comp={Plus} /> 新建高级任务</button>
        <button className="flex items-center gap-2 bg-[#f3f4f6] hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-full font-medium transition-colors text-sm"><Icon comp={BarChart2} /> 查看报告</button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">进行中的任务</h2>
      </div>

      <div className="grid gap-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onToggle={() => toggleStatus(task.id)} onDelete={() => deleteTask(task.id)} />
        ))}
      </div>

      {isModalOpen && <CustomTaskModal onClose={() => setIsModalOpen(false)} onSubmit={addCustomTask} />}
    </div>
  );
}
