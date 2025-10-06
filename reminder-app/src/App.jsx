import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [reminders, setReminders] = useState([])
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [reminderBefore, setReminderBefore] = useState(5)

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reminders')
    if (saved) {
      setReminders(JSON.parse(saved))
    }
  }, [])

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders))
  }, [reminders])

  // Check reminders every 10 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()

      reminders.forEach(reminder => {
        if (!reminder.notified) {
          const eventDateTime = new Date(`${reminder.date}T${reminder.time}`)
          const reminderTime = new Date(eventDateTime.getTime() - reminder.reminderBefore * 60000)

          if (now >= reminderTime && now <= eventDateTime) {
            showReminder(reminder)
            setReminders(prev => prev.map(r =>
              r.id === reminder.id ? { ...r, notified: true } : r
            ))
          }
        }
      })
    }

    checkReminders()
    const interval = setInterval(checkReminders, 10000)
    return () => clearInterval(interval)
  }, [reminders])

  const showReminder = (reminder) => {
    // Play sound
    playBeep()

    // Show alert
    alert(`⏰ REMINDER!\n\n${reminder.name}\n\nScheduled for: ${reminder.date} at ${reminder.time}`)
  }

  const playBeep = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    oscillator.start()
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const addReminder = (e) => {
    e.preventDefault()
    if (!eventName || !eventDate || !eventTime) return

    const newReminder = {
      id: Date.now(),
      name: eventName,
      date: eventDate,
      time: eventTime,
      reminderBefore: reminderBefore,
      notified: false
    }

    setReminders([...reminders, newReminder])
    setEventName('')
    setEventDate('')
    setEventTime('')
  }

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id))
  }

  const sortedReminders = [...reminders].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA - dateB
  })

  return (
    <div className="app">
      <h1>⏰ Reminder App</h1>

      <form onSubmit={addReminder} className="form">
        <input
          type="text"
          placeholder="Event name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="input"
        />

        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="input"
        />

        <input
          type="time"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
          className="input"
        />

        <select
          value={reminderBefore}
          onChange={(e) => setReminderBefore(Number(e.target.value))}
          className="input"
        >
          <option value={0}>At event time</option>
          <option value={5}>5 min before</option>
          <option value={10}>10 min before</option>
          <option value={15}>15 min before</option>
          <option value={30}>30 min before</option>
          <option value={60}>1 hour before</option>
        </select>

        <button type="submit" className="btn">Add Reminder</button>
      </form>

      <div className="reminders">
        <h2>Your Reminders</h2>
        {sortedReminders.length === 0 ? (
          <p className="empty">No reminders yet</p>
        ) : (
          sortedReminders.map(reminder => (
            <div key={reminder.id} className="reminder-card">
              <div className="reminder-info">
                <h3>{reminder.name}</h3>
                <p>{reminder.date} at {reminder.time}</p>
                {reminder.reminderBefore > 0 && (
                  <span className="badge">🔔 {reminder.reminderBefore} min before</span>
                )}
                {reminder.reminderBefore === 0 && (
                  <span className="badge">🔔 At event time</span>
                )}
              </div>
              <button onClick={() => deleteReminder(reminder.id)} className="delete-btn">
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App
