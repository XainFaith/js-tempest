class TestBedApp
{
    static instance = null;
    
    app;
    objectFactory;

    gameObjects;
    pointerCoords;
    mouseDown = false;

    constructor(app)
    {
        
        app.ticker.add(this.tick);

        if(TestBedApp.instance == null)
        {
            TestBedApp.instance = this;
        }

        this.app = app;

        this.objectFactory = new ObjectFactory();    
        this.gameObjects = new Array();
        this.pointerCoords = {x: 0, y: 0};

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                var myObj = JSON.parse(this.responseText);

                //Load blue prints
                TestBedApp.instance.objectFactory.loadBluePrints(myObj);

                //Registers component prototypes
                TestBedApp.instance.objectFactory.registerComponent("PositionableObject", PositionableObject.prototype);
                TestBedApp.instance.objectFactory.registerComponent("MovingComponent", MovingComponent.prototype);
                TestBedApp.instance.objectFactory.registerComponent("AnimatedSpriteRenderer", AnimatedSpriteRenderer.prototype);
            }
        };

        xmlhttp.open("GET", "./data/objects.json", true);
        xmlhttp.send();

        //load the image data for the bat sprite sheet and then call the spawn method
        PIXI.Loader.shared.add("./data/bat.json").load(this.spawn);

        //Set stage to interactive so we can get mouse related events
        app.stage.interactive = true;

        app.stage.mousemove = this.onMouseMove;

        app.renderer.view.addEventListener('mousedown', this.onMouseDown);
        app.renderer.view.addEventListener('mouseup', this.onMouseUp);

    }

    onMouseDown(e)
    {
        TestBedApp.instance.mouseDown = true;
    }

    onMouseUp(e)
    {
        TestBedApp.instance.mouseDown = false;
    }


    onMouseMove(e)
    {
        TestBedApp.instance.pointerCoords = e.data.global;
    }

    setFlee(flee)
    {
    
    }

    spawn()
    {
        //Grab refrences to the game object list and game object factory
        let gameObjects = TestBedApp.instance.gameObjects;
        let goFactory = TestBedApp.instance.objectFactory;

        //Spawn 100 bats
        for(let i = 0; i < 100; i++)
        {
            let gObj = null;
            
            if(i % 10 == 0)
            {
                gObj = goFactory.instanceBlueprint("RedBat");
            }
            else if(i % 5 == 0)
            {
                gObj = goFactory.instanceBlueprint("GreenBat");
            }
            else
            {
                gObj = goFactory.instanceBlueprint("Bat");
            }

            //Get positionable object component of the bat
            let coms = gObj.getComponentsByType("PositionableObject");
            if(coms.length != 0)
            {
                coms[0].x = getRandomArbitrary(100,900);
                coms[0].y = getRandomArbitrary(100,700);
            }

            gameObjects.push(gObj);
        }
    }

    tick(delta)
    {
        delta = TestBedApp.instance.app.ticker.elapsedMS;
        TestBedApp.instance.update(delta);
    }

    update(delta)
    {
        if(this.gameObjects.length != 0)
        {
            for(let i in this.gameObjects)
            {
                this.gameObjects[i].update(delta);
            }
        }
    }
}


window.onload = function()
{

    // Use the native window resolution as the default resolution
    // will support high-density displays when rendering
    PIXI.settings.RESOLUTION = window.devicePixelRatio;

    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new PIXI.Application({width: 1024, height: 800, backgroundColor: 0xdbdbdb});
    


    // The application will create a canvas element for you that you
    // can then insert into the DOM
    document.body.appendChild(app.view);

    window.testBedApp = new TestBedApp(app);
}

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}