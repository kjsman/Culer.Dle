unit = 60
zboard = -unit * 0.7
movetick = 0
count = 0
spinSpeed = 10

let illo = new Zdog.Illustration({
    element: '.zdog-canvas',
    dragRotate: true,
});

function c(k) {
    return (k - 1.5) * unit
}

function f(k) {
    return k ? "#E62" : "#FFF";
}

map = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
]

cube = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    front: 0,
    rear: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
}

bcube = null
board = [...new Array(4)].map(elem => new Array(4))

function createCheckBoard() {
    boardGroup = new Zdog.Group({
        addTo: illo,
        translate: { z: zboard },
        
    });
    for (x = 0; x < 4; x++) {
        for (y = 0; y < 4; y++) {
            board[x][y] = new Zdog.Rect({
                addTo: boardGroup,
                width: unit,
                height: unit,
                translate: { x: c(x), y: c(y)},
                stroke: 10,
                color: '#E62',
            });              
        }
    }
    new Zdog.Shape({
        addTo: boardGroup,
        visible: false,
        translate: {z: -9999}
    })
    new Zdog.Shape({
        addTo: boardGroup,
        path: [
          { x: c(4.5), y: c(-1) },
          { x: c(3.5), y: c(-1) },
          { x: c(4), y: c(-1.5) },
          { x: c(4), y: c(-0.5) },
        ],
        closed: false,
        stroke: 10,
        color: '#636',
      });
}

function createCube() {
    bcube = new Zdog.Box({
        addTo: illo,
        width: unit * 0.99,
        height: unit * 0.99,
        depth: unit * 0.99,
        translate: { x: c(0), y: c(0), z: zboard + unit / 2 },
        frontFace: f(cube.front), rearFace: f(cube.rear),
        leftFace: f(cube.left), rightFace: f(cube.right),
        topFace: f(cube.top), bottomFace: f(cube.bottom),
    })
}

function generateRandom() {
    i = 6
    while (i) {
        x = parseInt(Math.random() * 4)
        y = parseInt(Math.random() * 4)
        if (map[x][y] == 0) {
            map[x][y] = 1
            i--
        }
    }
    while (i == 0) {
        x = parseInt(Math.random() * 4)
        y = parseInt(Math.random() * 4)
        if (map[x][y] == 0) {
            cube.x = x
            cube.y = y
            i = 1
        }
    }
}

function syncAll() {
    for (x = 0; x < 4; x++) {
        for (y = 0; y < 4; y++) {
            board[x][y].fill = map[x][y] == 1
        }
    }

    bcube.translate.x = c(cube.x)
    bcube.translate.y = c(cube.y)
    bcube.frontFace = f(cube.front)
    bcube.rearFace = f(cube.rear)
    bcube.leftFace = f(cube.left)
    bcube.rightFace = f(cube.right)
    bcube.topFace = f(cube.top)
    bcube.bottomFace = f(cube.bottom)
}

function continueMove() {
    bcube.translate.x = c(cube.x + cube.dx * movetick / spinSpeed)
    bcube.translate.y = c(cube.y + cube.dy * movetick / spinSpeed)
    bcube.translate.z = zboard + unit / 2 + (Math.sin(Zdog.TAU / 8 + Zdog.TAU / 4 * movetick / spinSpeed) - Math.sin(Zdog.TAU / 8)) * unit / Math.sqrt(2)
    bcube.rotate.y = -cube.dx * movetick / spinSpeed * Zdog.TAU / 4
    bcube.rotate.x = -cube.dy * movetick / spinSpeed * Zdog.TAU / 4
    movetick++

    if (movetick == spinSpeed) {
        cube.x += cube.dx
        cube.y += cube.dy
        if (cube.dx == 1) {
            [cube.front, cube.right, cube.rear, cube.left] = [cube.left, cube.front, cube.right, cube.rear]
        } else if (cube.dx == -1) {
            [cube.front, cube.right, cube.rear, cube.left] = [cube.right, cube.rear, cube.left, cube.front]
        } else if (cube.dy == 1) {
            [cube.front, cube.top, cube.rear, cube.bottom] = [cube.top, cube.rear, cube.bottom, cube.front]
        } else if (cube.dy == -1) {
            [cube.front, cube.top, cube.rear, cube.bottom] = [cube.bottom, cube.front, cube.top, cube.rear]
            
        }
        cube.dx = 0
        cube.dy = 0
        bcube.translate.z = zboard + unit / 2
        bcube.rotate.x = 0
        bcube.rotate.y = 0
        tmp = cube.rear
        cube.rear = map[cube.x][cube.y]
        map[cube.x][cube.y] = tmp
        movetick = 0

        if (cube.front * cube.rear * cube.left * cube.right * cube.top * cube.bottom) {
            if (count <= 50) msg = `와! ${count}번만에`
            else if (count >= 150) msg = `${count}번이나 걸려서`
            else msg = `${count}번에`
            alert(`${msg} 깨셨습니다. 축하합니다!\n\n지금 캡쳐하세요. 이 메시지 닫자마자 새로고침될거임`)
            location.reload()
        }
    }
}

function init() {
    createCheckBoard()
    generateRandom()
    createCube()
}

function animate() {
    if (movetick) continueMove()
    if (movetick == 0) syncAll()
    illo.updateRenderGraph();
    requestAnimationFrame( animate );
}

function move(dx, dy) {
    if (movetick) return
    x = cube.x + dx
    y = cube.y + dy
    if (x < 0 || x > 3) return
    if (y < 0 || y > 3) return
    count++
    document.getElementById('count').innerText = count
    cube.dx = dx
    cube.dy = dy
    movetick = 1
}

moveUp = () => move(0, -1)
moveDown = () => move(0, 1)
moveRight = () => move(1, 0)
moveLeft = () => move(-1, 0)

window.addEventListener('keydown', function(event) {
    const callback = {
        "ArrowUp"    : moveUp,
        "ArrowDown"  : moveDown,
        "ArrowRight" : moveRight,
        "ArrowLeft"  : moveLeft,
        "KeyW"    : moveUp,
        "KeyS"  : moveDown,
        "KeyD" : moveRight,
        "KeyA"  : moveLeft,
    }[event.code]
    callback?.()
});

init()
animate();