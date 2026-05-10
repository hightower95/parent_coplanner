import { useState } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { ChevronDown, ChevronRight, Plus, X, Tag, Clock, Calendar } from 'lucide-react';
import { EventCard } from './EventCard';
import { AddDayTagDialog } from './AddDayTagDialog';
import { RegisterTimeDialog } from './RegisterTimeDialog';

interface Event {
  id: string;
  title: string;
  location: string;
  date: Date;
  time: string;
  createdBy: string;
  attendees: string[];
  isPrivate: boolean;
}

interface DayTag {
  id: string;
  date: Date;
  tag: string;
}

interface TimeBlock {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  note: string;
}

interface WeekPlannerProps {
  events: Event[];
  dayTags: DayTag[];
  timeBlocks: TimeBlock[];
  selectedDays: Date[];
  currentUser: string;
  onJoinEvent: (id: string) => void;
  onLeaveEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onCreateEvent: (date: Date) => void;
  onAddTag: (date: Date, tag: string) => void;
  onRemoveTag: (id: string) => void;
  onRegisterTime: (date: Date, startTime: string, endTime: string, note: string) => void;
  onRemoveTimeBlock: (id: string) => void;
  onToggleDaySelection: (date: Date) => void;
  onClearSelection: () => void;
}

export function WeekPlanner({
  events,
  dayTags,
  timeBlocks,
  selectedDays,
  currentUser,
  onJoinEvent,
  onLeaveEvent,
  onDeleteEvent,
  onCreateEvent,
  onAddTag,
  onRemoveTag,
  onRegisterTime,
  onRemoveTimeBlock,
  onToggleDaySelection,
  onClearSelection
}: WeekPlannerProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 2));

  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [showAddTag, setShowAddTag] = useState<Date | null>(null);
  const [showRegisterTime, setShowRegisterTime] = useState<Date | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  const getDayEvents = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getUserEvents = (date: Date) => {
    return events.filter(event =>
      isSameDay(event.date, date) && event.attendees.includes(currentUser)
    );
  };

  const getDayTags = (date: Date) => {
    return dayTags.filter(tag => isSameDay(tag.date, date));
  };

  const getDayTimeBlocks = (date: Date) => {
    return timeBlocks.filter(block => isSameDay(block.date, date));
  };

  const isSelected = (date: Date) => {
    return selectedDays.some(d => isSameDay(d, date));
  };

  const handleDayClick = (day: Date) => {
    if (selectedDays.length > 0) {
      onToggleDaySelection(day);
    } else {
      setExpandedDay(expandedDay && isSameDay(expandedDay, day) ? null : day);
    }
  };

  const handleTouchStart = (day: Date) => {
    const timer = window.setTimeout(() => {
      onToggleDaySelection(day);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, day: Date) => {
    e.preventDefault();
    onToggleDaySelection(day);
  };

  return (
    <div className="space-y-2">
      {days.map(day => {
        const isToday = isSameDay(day, today);
        const dayEvents = getDayEvents(day);
        const userEvents = getUserEvents(day);
        const tags = getDayTags(day);
        const blocks = getDayTimeBlocks(day);
        const hasEvents = dayEvents.length > 0;
        const isExpanded = expandedDay && isSameDay(expandedDay, day);
        const isDaySelected = isSelected(day);

        return (
          <div
            key={day.toISOString()}
            className={`bg-white border rounded-lg transition-all ${
              isDaySelected
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200'
            }`}
          >
            <button
              onClick={() => handleDayClick(day)}
              onTouchStart={() => handleTouchStart(day)}
              onTouchEnd={handleTouchEnd}
              onContextMenu={(e) => handleContextMenu(e, day)}
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {format(day, 'EEEE')}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {format(day, 'MMM d')}
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full"
                        >
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {blocks.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {blocks.map(block => (
                        <div key={block.id} className="text-sm text-orange-700">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {block.startTime} - {block.endTime}
                          {block.note && ` • ${block.note}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasEvents && tags.length === 0 && blocks.length === 0 ? (
                    <p className="text-sm text-gray-500">Free all day</p>
                  ) : userEvents.length === 0 && hasEvents ? (
                    <p className="text-sm text-gray-600">
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} available
                    </p>
                  ) : userEvents.length > 0 ? (
                    <div className="space-y-1">
                      {userEvents.map(event => (
                        <div key={event.id} className="text-sm">
                          <span className="font-medium text-blue-600">{event.time}</span>
                          <span className="text-gray-700 ml-2">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > userEvents.length && (
                        <p className="text-xs text-gray-500">
                          +{dayEvents.length - userEvents.length} more available
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 ml-4" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="mt-4 space-y-4">
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddTag(day)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                    >
                      <Tag className="w-4 h-4" />
                      Add tag
                    </button>
                    <button
                      onClick={() => setShowRegisterTime(day)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100"
                    >
                      <Clock className="w-4 h-4" />
                      Register time
                    </button>
                    <button
                      onClick={() => onCreateEvent(day)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      <Calendar className="w-4 h-4" />
                      Create event
                    </button>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <div
                            key={tag.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full group"
                          >
                            <span className="text-sm">{tag.tag}</span>
                            <button
                              onClick={() => onRemoveTag(tag.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Blocks */}
                  {blocks.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Time Blocks</h4>
                      <div className="space-y-2">
                        {blocks.map(block => (
                          <div
                            key={block.id}
                            className="flex items-center justify-between p-2 bg-orange-50 rounded-lg group"
                          >
                            <div className="text-sm text-orange-900">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {block.startTime} - {block.endTime}
                              {block.note && <span className="text-orange-700"> • {block.note}</span>}
                            </div>
                            <button
                              onClick={() => onRemoveTimeBlock(block.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                              <X className="w-3 h-3 text-orange-700" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {dayEvents.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">
                        Events ({dayEvents.length})
                      </h4>
                      <div className="space-y-3">
                        {dayEvents
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map(event => (
                            <EventCard
                              key={event.id}
                              event={event}
                              currentUser={currentUser}
                              onJoin={onJoinEvent}
                              onLeave={onLeaveEvent}
                              onDelete={onDeleteEvent}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {showAddTag && (
        <AddDayTagDialog
          isOpen={true}
          onClose={() => setShowAddTag(null)}
          onAdd={(tag) => onAddTag(showAddTag, tag)}
          existingTags={getDayTags(showAddTag).map(t => t.tag)}
        />
      )}

      {showRegisterTime && (
        <RegisterTimeDialog
          isOpen={true}
          onClose={() => setShowRegisterTime(null)}
          onRegister={(start, end, note) => onRegisterTime(showRegisterTime, start, end, note)}
        />
      )}
    </div>
  );
}
