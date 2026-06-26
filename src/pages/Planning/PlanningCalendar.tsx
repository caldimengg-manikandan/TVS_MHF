import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { PlanningService } from '../../services/planningService';
import { DailyPlan } from '../../types/planning';
import '../../App.css';

export default function PlanningCalendar() {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const fetched = await PlanningService.getAllPlans();
    setPlans(fetched);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Generate blank prefix cells
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  // Generate days in month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dateStr: string) => {
    navigate(`/planning/daily?date=${dateStr}`);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="Planning Calendar" subtitle="Monthly overview of daily generation schedules and workflow statuses" />
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="btn-secondary" onClick={handlePrevMonth}>&larr; Prev</button>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', width: '200px', textAlign: 'center', color: 'var(--primary-color)' }}>
                {monthNames[month]} {year}
              </h2>
              <button className="btn-secondary" onClick={handleNextMonth}>Next &rarr;</button>
            </div>
            <div>
              <span className="badge badge-positive" style={{ marginRight: '8px' }}>Approved</span>
              <span className="badge badge-warning" style={{ marginRight: '8px' }}>Locked</span>
              <span className="badge badge-neutral">Draft / Submitted</span>
            </div>
          </div>

          <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'var(--border-subtle)' }}>
              
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ backgroundColor: 'var(--bg-hover)', padding: '1rem', fontWeight: 'bold', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  {day}
                </div>
              ))}

              {/* Blank Cells */}
              {blanks.map(b => (
                <div key={`blank-${b}`} style={{ backgroundColor: 'var(--bg-surface)', minHeight: '120px' }}></div>
              ))}

              {/* Day Cells */}
              {days.map(d => {
                const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dayPlans = plans.filter(p => p.date === dayStr);
                const isToday = dayStr === todayStr;

                return (
                  <div 
                    key={d} 
                    onClick={() => handleDayClick(dayStr)}
                    style={{ 
                      backgroundColor: isToday ? 'var(--primary-color-light)' : 'var(--bg-surface)', 
                      minHeight: '120px', 
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      if (!isToday) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isToday) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: isToday ? 'bold' : 'normal',
                        color: isToday ? 'var(--primary-color)' : 'var(--text-primary)',
                      }}>
                        {d}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                      {dayPlans.map(p => {
                        const statusClass = p.status === 'Approved' ? 'positive' : p.status === 'Locked' ? 'warning' : 'neutral';
                        return (
                          <div 
                            key={p.id} 
                            className={`badge badge-${statusClass}`} 
                            style={{ 
                              display: 'block',
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              textAlign: 'left',
                              width: '100%',
                              boxSizing: 'border-box'
                            }} 
                            title={`${p.id} - ${p.status}`}
                          >
                            {p.status.toUpperCase()}
                          </div>
                        );
                      })}
                      {dayPlans.length === 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 'auto' }}>
                          No plans
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
