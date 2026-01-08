import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskManager: React.FC = () => {
  const tasks = useAppStore(state => state.tasks);
  const addTask = useAppStore(state => state.addTask);
  const toggleTask = useAppStore(state => state.toggleTask);
  const deleteTask = useAppStore(state => state.deleteTask);
  
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask('');
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-2">
        <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg">
          <CheckCircle2 size={20} />
        </span>
        Tareas
      </h2>

      {/* Add Task Input */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nueva tarea..."
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 block w-full p-3 pr-10 placeholder-white/20 transition-all hover:bg-white/10"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-0"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <p className="text-white/30 text-sm">Todo al día. ¡Buen trabajo!</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                layout
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    task.completed ? "text-emerald-400" : "text-white/30 hover:text-white/60"
                  )}
                >
                  {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                
                <span className={cn(
                  "flex-1 text-sm break-all transition-all",
                  task.completed ? "text-white/30 line-through" : "text-white/90"
                )}>
                  {task.text}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                  aria-label="Eliminar tarea"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
