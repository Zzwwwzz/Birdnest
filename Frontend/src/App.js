import { useState, useEffect } from 'react'
import Footer from './components/Footer'
import PilotElement from './components/PilotElement'
import pilotService from './services/pilots'


const closestViolation = (pilots) => {
  if (pilots.length > 0) {
    pilots = pilots.sort((a,b) => Math.floor(a.distance) - Math.floor((b.distance)))
  return <PilotElement key={pilots[0].serialNumber} pilot={pilots[0]}/>

  }
}

const App = () => {
  const [pilots, setPilots] = useState([])

  // The loop to show updated data
  useEffect(() => {
    const intervalId = setInterval(() =>{
    pilotService
      .getAll()
      .then(allPilots => {
        setPilots(allPilots)
      })
    }, 2000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div>
      <h2>NDZ Violations</h2>
      <ul>
        {pilots.map(pilot => 
          <PilotElement
            key={pilot.serialNumber}
            pilot={pilot}
          />
        )}
      </ul>
      <p>The closest violation to the nest has been</p>
      <ul>{closestViolation(pilots)}</ul>
      <Footer />
    </div>
  )
}

export default App