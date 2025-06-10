const { calculateDistance, parseDrones } = require('../modules/drone')

describe('calculateDistance', () => {
  test('origin distance is zero', () => {
    expect(calculateDistance([250000, 250000])).toBe(0)
  })

  test('calculates euclidean distance', () => {
    expect(calculateDistance([250100, 250100])).toBe(Math.floor(Math.sqrt(100**2 + 100**2)))
  })
})

describe('parseDrones', () => {
  test('parses drone xml data structure', () => {
    const data = {
      report: {
        capture: [
          {
            '$': { snapshotTimestamp: '2024-01-01T00:00:00Z' },
            drone: [
              {
                serialNumber: ['1234'],
                positionX: ['250000'],
                positionY: ['250000'],
              },
            ],
          },
        ],
      },
    }

    const result = parseDrones(data)
    expect(result.timestamp).toEqual(new Date('2024-01-01T00:00:00Z'))
    expect(result.drones).toHaveLength(1)
    expect(result.drones[0].serialNumber).toBe('1234')
    expect(result.drones[0].distance).toBe(0)
  })
})