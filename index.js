class Utils {
    static gameOver = false;
    static score = 0;

    static makeImage(src) {
        let image = new Image();
        image.src = src;
        return image;
    }
}

class Keyboard {
    static pressedKeys = new Array(255);

    static init() {
        document.addEventListener("keydown", event => {
            Keyboard.pressedKeys[event.keyCode] = true;
        });
        document.addEventListener("keyup", event => {
            Keyboard.pressedKeys[event.keyCode] = false;
        });    
    }

    static isKeyPressed(char) {
        return Keyboard.pressedKeys[char.charCodeAt(0)];
    }
}

class Scene {
    constructor(name) {
        this.gameObjects = new Array();
        this.name = name;
    }

    getGameObjects() {
        return this.gameObjects;
    }

    add(gameObject) {
        gameObject.setScene(this);
        this.gameObjects.push(gameObject);
    }

    remove(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }

    update() {
        this.gameObjects.forEach(element => {
            element.update();
        });
    }

    draw(ctx) {
        this.gameObjects.forEach(element => {
            element.draw(ctx);
        });
    }
}

class SceneManager {
    static instance = new SceneManager();

    constructor() {
        this.scenes = new Array();
        this.activeScene = null;
    }

    static getInstance() {
        return SceneManager.instance;
    }

    get(sceneName) {
        for (let i = 0; i < this.scenes.length; i++) {
            let scene = this.scenes[i];
            if (scene.name === sceneName) {
                return scene;
            }
        }
    }

    add(sceneName) {
        let scene = new Scene(sceneName);
        this.scenes.push(scene);
        this.activeScene = scene;
        return scene;
    }

    setActiveScene(sceneName) {
        this.activeScene = this.get(sceneName);
    }

    getActiveScene() {
        return this.activeScene;
    }

    update() {
        this.activeScene.update();
    }

    draw(ctx) {
        this.activeScene.draw(ctx);
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.vel = 1;

        this.right = true;
        this.left = true;
        this.up = true;
        this.down = true;

        this.scene = null;
        this.image = Utils.makeImage("playerImage.png");
    }

    setScene(scene) {
        this.scene = scene;
    }

    addVelocity(x, y) {
        if (this.x + this.width + x < canvas.width)
            this.x += x;

        if (this.x < 0)
            Utils.gameOver = true;

        if (this.y + y > 0 && this.y + this.height + y < canvas.height)
            this.y += y;
    }

    checkCollision() {
        let gameObjects = this.scene.getGameObjects();

        this.right = true;
        this.left = true;
        this.up = true;
        this.down = true;

        for (let i = 0; i < gameObjects.length; i++) {
            let gameObject = gameObjects[i];

            if (gameObject === this) {
                continue;
            }

            if (this.y < gameObject.y + gameObject.height && this.y + this.height > gameObject.y) {
                if (this.x + this.width + this.vel > gameObject.x && this.x < gameObject.x) {
                    // this.right = false;
                    this.addVelocity(-this.vel, 0);
                }
                if (this.x - this.vel < gameObject.x + gameObject.width && this.x > gameObject.x) {
                    // this.left = false;
                    this.addVelocity(this.vel, 0);
                }
            }
            if (this.x < gameObject.x + gameObject.width && this.x + this.width > gameObject.x) {
                if (this.y + this.height + this.vel > gameObject.y && this.y < gameObject.y) {
                    // this.down = false;
                    this.addVelocity(0, -this.vel);
                }
                if (this.y - this.vel < gameObject.y + gameObject.height && this.y > gameObject.y) {
                    // this.up = false;
                    this.addVelocity(0, this.vel);
                }
            }
        }
    }

    update() {
        this.checkCollision();

        if (Keyboard.isKeyPressed('A') && this.left) {
            this.addVelocity(-this.vel, 0);
        } else if (Keyboard.isKeyPressed('D') && this.right) {
            this.addVelocity(this.vel, 0);
        }
        if (Keyboard.isKeyPressed('S') && this.down) {
            this.addVelocity(0, this.vel);
        } else if (Keyboard.isKeyPressed('W') && this.up) {
            this.addVelocity(0, -this.vel);
        }
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y);
    }
}

class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setScene(scene) {
        this.scene = scene;
    }

    update() {
        this.x -= 1;
        if (this.x + this.width < 0) {
            Utils.score++;
            this.scene.remove(this);
        }
    }

    draw(ctx) {
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

window.onload = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    Keyboard.init();

    let sceneManager = SceneManager.getInstance();
    let gameScene = sceneManager.add("Game");
    gameScene.add(new Player(100, canvas.height / 2 - 32));
    gameScene.add(new Wall(canvas.width, canvas.height / 2 - 25, 50, 50));

    let lastTime = Date.now();
    let deltaTime = 0;

    setInterval(() => {
        if (Utils.gameOver) {
            return;
        }

        let now = Date.now();
        deltaTime += now - lastTime;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (deltaTime > 1000 * 1000) {
            gameScene.add(new Wall(canvas.width, Math.floor(Math.random() * (canvas.height - 50)) + 25, 50, 50));
            deltaTime = 0;
        }
        
        sceneManager.update();
        sceneManager.draw(ctx);

        ctx.fillStyle = "white"
        ctx.font = "30px Arial";
        ctx.fillText("SCORE: " + Utils.score, 10, 50); 
    });
}
