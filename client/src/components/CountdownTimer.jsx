import { useEffect, useState } from 'react'
import { LAUNCH_DATE } from '../config'

function getTimeParts() {
  const diff = Math.max(0, new Date(LAUNCH_DATE).getTime() - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

const UNITS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
]

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeParts)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeParts()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="countdown" role="timer" aria-label="Time remaining until launch">
      {UNITS.map((unit, i) => (
        <div className="countdown__unit" key={unit.key} style={{ '--i': i }}>
          <span className="countdown__value">
            {String(time[unit.key]).padStart(2, '0')}
          </span>
          <span className="countdown__label">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}
