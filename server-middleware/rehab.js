const session = {
  id: 'stroke-leg-strength-01',
  exercise: 'Seated knee lift',
  targetAngle: { min: 38, max: 72 },
  sensor: { deviceId: 'LEG-BAND-SIM-01', battery: 82, connected: true }
}

export default function rehab(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true, session, timestamp: Date.now() }))
}