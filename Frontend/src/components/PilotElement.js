// Handles single pilot as list element

const Pilot = (pilot) => {
  let violationLabel = pilot.pilot.violations.length === 1 
  ? "violation" : "violations"
  
    return (
      <li className="pilot">
        Pilot: {pilot.pilot.firstName} {pilot.pilot.lastName} ({pilot.pilot.phoneNumber}, {pilot.pilot.email}) <br/>
        Closest distance from nest: {(pilot.pilot.distance/1000).toFixed(2)} meters from {pilot.pilot.violations.length} {violationLabel}
      </li>
    )
  }
  
  export default Pilot