import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, RefreshCw } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths, 
  isToday,
  isSameDay,
  parseISO,
  startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppStore } from '../../store/useStore';
import ICAL from 'ical.js';

interface Holiday {
  date: string;
  localName: string;
  name: string;
}

interface GoogleEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'google';
}

const CORS_PROXY = 'https://api.allorigins.win/get?url=';

export const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  
  const events = useAppStore(state => state.events);
  const addEvent = useAppStore(state => state.addEvent);
  const removeEvent = useAppStore(state => state.removeEvent);
  const calendarUrl = useAppStore(state => state.calendarUrl);
  
  // UI State for adding event
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // ... (Fetch Holidays remains same) ...
  useEffect(() => {
    const year = new Date().getFullYear();
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/CL`)
      .then(res => res.json())
      .then(data => {
        const today = new Date();
        const upcoming = data.filter((h: Holiday) => new Date(h.date) >= today)
                             .slice(0, 5);
        setHolidays(upcoming);
      })
      .catch(err => console.error("Failed to fetch holidays", err));
  }, []);

  // Fetch Google Calendar (iCal)
  const fetchGoogleCalendar = async () => {
    if (!calendarUrl) return;
    setLoadingGoogle(true);
    try {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(calendarUrl)}`);
      const data = await response.json();
      const icsData = data.contents;

      if (!icsData || typeof icsData !== 'string') {
        console.warn("Calendar proxy returned invalid data:", icsData);
        return;
      }

      try {
        const jcalData = ICAL.parse(icsData);
        if (!jcalData) throw new Error("ICAL parse returned null");

        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const parsedEvents: GoogleEvent[] = vevents.map((vevent: any) => {
          const event = new ICAL.Event(vevent);
          return {
            id: event.uid,
            title: event.summary,
            date: event.startDate.toJSDate().toISOString(),
            endDate: event.endDate ? event.endDate.toJSDate().toISOString() : undefined,
            type: 'google' as const
          };
        });
        
        const today = startOfDay(new Date());
        const upcoming = parsedEvents.filter(e => new Date(e.endDate || e.date) >= today)
                                     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                     .slice(0, 10);
        
        setGoogleEvents(upcoming);
      } catch (parseError) {
        console.error("Error parsing iCal data:", parseError);
        // Do not throw, just stop loading this calendar
      }

    } catch (error) {
      console.error("Error fetching iCal:", error);
    } finally {
      setLoadingGoogle(false);
    }
  };

  useEffect(() => {
    if (calendarUrl) {
      fetchGoogleCalendar();
    }
  }, [calendarUrl]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventTitle.trim()) {
      addEvent(newEventTitle, selectedDate.toISOString(), newEventEndDate ? new Date(newEventEndDate).toISOString() : undefined);
      setNewEventTitle('');
      setNewEventEndDate('');
      setIsAddingEvent(false);
    }
  };

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsAddingEvent(true);
  };

  // Merge all events
  const allEvents = [
    ...holidays.map(h => ({ id: `holiday-${h.date}`, title: h.localName, date: h.date, type: 'holiday' as const })),
    ...events,
    ...googleEvents
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Check if day has event (Point)
  const getEventForDay = (day: Date) => {
    return allEvents.find(e => isSameDay(parseISO(e.date), day));
  };

  // Check if day is inside a range (Period)
  const isDayInEventRange = (day: Date) => {
    return allEvents.find(e => {
      if (e.type === 'holiday') return false;
      if (!e.endDate) return false;
      const start = startOfDay(parseISO(e.date));
      const end = startOfDay(parseISO(e.endDate));
      // Adjust end date -1 day because iCal end date is usually exclusive
      const adjustedEnd = new Date(end); 
      adjustedEnd.setDate(adjustedEnd.getDate() - 1);
      
      return day >= start && day <= adjustedEnd;
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
          <span className="bg-purple-500/10 text-purple-400 p-1.5 rounded-lg">
            <CalendarIcon size={20} />
          </span>
          Agenda
        </h2>
        {calendarUrl && (
          <button 
            onClick={fetchGoogleCalendar} 
            disabled={loadingGoogle}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={loadingGoogle ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      {/* Mini Calendar */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-white/40 font-medium">
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
             <div key={`pad-${i}`} />
          ))}
          
          {calendarDays.map(day => {
            const dayEvent = getEventForDay(day);
            const rangeEvent = isDayInEventRange(day);
            const isRange = !!rangeEvent;
            
            return (
            <div 
              key={day.toString()} 
              onClick={() => onDateClick(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all relative
                ${!isSameMonth(day, currentDate) ? 'text-white/20' : 'text-white/80'}
                ${isToday(day) ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : ''}
                ${!isToday(day) && isRange ? 'bg-amber-500/20 text-amber-200' : ''}
                ${!isToday(day) && !isRange ? 'hover:bg-white/10' : ''}
                ${isSameDay(day, selectedDate) && isAddingEvent ? 'ring-2 ring-purple-500' : ''}
              `}
              title={dayEvent?.title || rangeEvent?.title}
            >
              <span>{format(day, 'd')}</span>
              {dayEvent && !isRange && (
                <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />
              )}
            </div>
          )})}
        </div>
      </div>

      {/* Add Event Form Overlay */}
      {isAddingEvent && (
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-4 animate-in slide-in-from-top-2 shadow-2xl">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3 font-bold">
            Nuevo evento: <span className="text-purple-400">{format(selectedDate, 'd MMMM', { locale: es })}</span>
          </p>
          <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
            {/* Primary Row: Title + Save Button */}
            <div className="flex gap-2">
              <input 
                type="text" 
                autoFocus
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Título del evento..."
                className="flex-1 bg-black/20 text-white text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-purple-500 outline-none transition-colors"
              />
              <button 
                type="submit" 
                disabled={!newEventTitle.trim()}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20"
                title="Guardar evento"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Secondary Row: Optional End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-white/30 uppercase font-bold px-1">Hasta (Opcional)</label>
              <input 
                type="date" 
                value={newEventEndDate}
                onChange={(e) => setNewEventEndDate(e.target.value)}
                className="w-full bg-black/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <button 
              type="button" 
              onClick={() => {
                setIsAddingEvent(false);
                setNewEventEndDate('');
                setNewEventTitle('');
              }} 
              className="text-xs text-white/30 hover:text-rose-400 transition-colors text-left px-1 mt-1 w-fit"
            >
              ✕ Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
          Próximos Eventos
        </h3>
        
        {allEvents.length > 0 ? (
          allEvents.map((e) => (
            <div key={e.id} className="flex gap-3 items-start group relative">
              <div className={`flex flex-col items-center rounded-lg p-2 min-w-[50px] border transition-colors 
                ${e.type === 'holiday' ? 'bg-white/5 border-white/5' : 
                  e.type === 'google' ? 'bg-blue-500/10 border-blue-500/20' : 
                  'bg-purple-500/10 border-purple-500/20'}`}>
                <span className="text-xs text-white/60 uppercase">
                  {format(parseISO(e.date), 'MMM', { locale: es })}
                </span>
                <span className="text-lg font-bold text-white">
                  {format(parseISO(e.date), 'd')}
                </span>
              </div>
              <div className="py-1 flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate group-hover:text-purple-300 transition-colors">
                  {e.title}
                </p>
                <div className="flex justify-between items-center">
                   <p className="text-xs text-white/50 flex items-center gap-1">
                     {e.type === 'holiday' && 'Feriado'}
                     {e.type === 'google' && <><span className="w-1.5 h-1.5 rounded-full bg-blue-400"/> Google Calendar</>}
                     {e.type === 'personal' && 'Personal'}
                     {/* Show duration if multi-day */}
                     {e.type !== 'holiday' && e.endDate && (
                       <span className="text-amber-400 ml-1 font-bold">
                         ➜ {format(parseISO(e.endDate), 'd MMM', { locale: es })}
                       </span>
                     )}
                   </p>
                   {e.type === 'personal' && (
                     <button 
                       onClick={() => removeEvent(e.id)}
                       className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-300 transition-opacity"
                     >
                       <Trash2 size={12} />
                     </button>
                   )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/40 italic">Agenda libre.</p>
        )}
      </div>
    </div>
  );
};
