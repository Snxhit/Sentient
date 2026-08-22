const CONFIG = {
    world: {
        width: 500,
        height: 100,
        tileSize: 20
    },

    simulation: {
        tickRate: 300
    },

    physics: {
        gravity: 0.2,
        terminalVelocity: 6,
        maxStep: 0.25,
    },

    entities: {
        foodSmellRange: 8
    },

    camera: {
        speed: 15,
        minZoom: 5,
        maxZoom: 60
    },
}

export default CONFIG;