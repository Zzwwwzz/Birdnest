const Pilot = (pilot) => {
    return (
      <li className="pilot">
        Pilot: {pilot.pilot.firstName} {pilot.pilot.lastName} ({pilot.pilot.phoneNumber}, {pilot.pilot.email}) <br/>
        Closest distance from nest: {pilot.pilot.distance/100} meters from {pilot.pilot.violations.length} violation(s)
      </li>
    )
  }
  
  export default Pilot