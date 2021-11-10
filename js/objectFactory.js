
//An object factory the produces game objects from blue prints residing in a json file
class ObjectFactory
{
    //Singleton Instace of the object factory
    static instance = null;

    //Map of Blue Prints as defined in a json file
    bluePrints;

    //The map of registers component prototypes
    componentPrototypes;

    //Flag for when the blue prints have been loaded
    isReady = false;

    constructor()
    {
        if(ObjectFactory.instance == null)
        {
            ObjectFactory.instance = this;
        }

        this.bluePrints = new Map();
        this.componentPrototypes = new Map();
    }

    //Loads the json parsed objects of the json blue prints file
    loadBluePrints(bluePrints)    
    {
        for(let name in bluePrints)
        {
            this.bluePrints.set(name,bluePrints[name]);
        }

        this.isReady = true;
    }

    //Registers a component prototype
    registerComponent(name, prototype)
    {
        this.componentPrototypes.set(name,prototype);
    }

    //Instances a game object of the given blue print name
    instanceBlueprint(name)
    {
        //Sainty check
        if(this.bluePrints.has(name))
        {
            //defines a variable for the game object
            let gObj = null;

            //get the blue print
            let bluePrint = this.bluePrints.get(name);

            //Does this blue print inherit another blue print
            if(bluePrint.inherits !== undefined)
            {
                //if the game object inherits a blue print 
                gObj = this.instanceBlueprint(bluePrint.inherits);
            }

            //If inheritance was not present we can just contruct an empty game object
            if(gObj == null)
            {
                gObj = new GameObject();
            }

            //Does the blue print contain components
            if(bluePrint.components !== undefined)
            {   

                let coms = new Array();

                //Iterate over components listed in the blue print
                for(let i in bluePrint.components)
                {
                    //Sanity check to ensure the component type is registered
                    if(this.componentPrototypes.has(bluePrint.components[i].componentType))
                    {
                        //Get the component prototype
                        let proto = this.componentPrototypes.get(bluePrint.components[i].componentType);

                        //Instance the component
                        let com = Object.create(proto);
                        com.type = bluePrint.components[i].componentType;
                        
                        
                        //Call initalize, this is important as the constructor is never called because it was instanced using Object.create
                        com.initalize();

                        //Were there properties to set on the instanced component described in the blue print
                        if(bluePrint.components[i].params !== undefined)
                        {
                            //Loop over params and set there values
                            for(let j in  bluePrint.components[i].params)
                            {
                                com[j] = bluePrint.components[i].params[j];
                            }
                        }
                        
                        //Add the component to the game object
                        gObj.addComponent(com);
                        coms.push(com);
                    }
                    else
                    {
                        console.error("Unknown Component Type Reqested: " + bluePrint.components[i].componentType);
                    }

                    //Call added to object after all components have been added avoids components that need refrences to other components
                    //having issues with that component not having been added to the game object yet
                    for(let k in coms)
                    {
                        coms[k].addedToObject(gObj);
                    }
                }
            }

            //All things went well return the newly instance game object
            return gObj;
        }
        else
        {
            console.error("Attempted to instance an object with no known blueprint: " + name);
        }

        //Something went wrong
        return null;
    }
}


//Base class for Components
class Component
{
    //The name of the component if set
    name;

    //The owning game object
    parent;

    //A string representing the components type, used internally
    type;

    //Called when the component is first instance, this is used because the constructor is never called because of how it is instance
    //Do initalization code here instead of in a constructor
    initalize()
    {
        this.name = null;
    }

    //Called when the component is added to a Game object
    addedToObject(obj)
    {
        this.parent = obj;
    }

    //Called when the component is removed from a Game object
    removedFromObject(obj)
    {
        this.parent = null;
    }

    //Used to update the component
    update(delta)
    {

    }
}


//Base Game Object 
class GameObject
{
    //The components attached to this game object
    components = new Array();

    //Addeds a component to the GObj
    addComponent(com)
    {
        this.components.push(com);
    }

    //Removes a component from the GObj
    removeComponent(com)
    {
        let index = this.components.indexOf(com);

        if(index !== undefined && index !== null)
        {
            this.components.splice(index, 1);
            com.removedFromObject(this);
        }
    }

    //Gets all the components of the given type from the GObj
    getComponentsByType(com)
    {
        
        let results = new Array();
        for(let i in this.components)
        {
            if(this.components[i].type == com)
            {
                results.push(this.components[i]);
            }
        }

        return results;
    }

    //Returns a component by its name, names are only valid when the name is set in the blue print
    getComponentByName(name)
    {
        for(let i in this.components)
        {
            if(this.components[i].name == name)
            {
                return this.components[i];
            }
        }

        return null;
    }

    //Updates the components attached to the game object
    update(delta)
    {
        for(let i in this.components)
        {
            this.components[i].update(delta);
        }
    }
}

//Positionable object component
class PositionableObject extends Component
{
    x;
    y;

    initalize()
    {
        super.initalize();

        this.x =0;
        this.y =0;
    }
}

//a component that causes the game object to move towards or away from the cursor
class MovingComponent extends Component
{

    flee;
    poObject;
    velocity;

    initalize()
    {
        super.initalize();
        this.flee = false;
        this.velocity = 100;
    }

    addedToObject(obj)
    {
        super.addedToObject(obj);
        
        //Get refrence to the Positionable Object 
        this.poObject = obj.getComponentsByType("PositionableObject")[0];
    }

    update(delta)
    {
        
        this.flee = TestBedApp.instance.mouseDown;
        let mag = Math.sqrt(this.poObject.x*this.poObject.x + this.poObject.y*this.poObject.y);

        if(TestBedApp.instance.pointerCoords.x != 0)
        {
            let vectorX = TestBedApp.instance.pointerCoords.x - this.poObject.x;

            if(vectorX != 0)
            {
                if(this.flee)
                {
                    this.poObject.x -= ((vectorX / mag) * this.velocity) / (delta);
                }
                else
                {
                    this.poObject.x += ((vectorX / mag) * this.velocity) / (delta);
                }
            }

        }

        if(this.poObject.x < 0)
        {
            this.poObject.x = 0;
        }
        
        if(this.poObject.x > TestBedApp.instance.app.screen.width - 32)
        {
            this.poObject.x = TestBedApp.instance.app.screen.width - 32;
        }

        if(TestBedApp.instance.pointerCoords.y != 0)
        {
            let vectorY = TestBedApp.instance.pointerCoords.y - this.poObject.y;

            if(vectorY != 0)
            {
                if(this.flee)
                {
                    this.poObject.y -= ((vectorY / mag) * this.velocity) / (delta);
                }
                else
                {
                    this.poObject.y += ((vectorY / mag) * this.velocity) / (delta);
                }
            }

        }

        if(this.poObject.y < 0)
        {
            this.poObject.y = 0;
        }
        
        if(this.poObject.y > TestBedApp.instance.app.screen.height - 32)
        {
            this.poObject.y = TestBedApp.instance.app.screen.height - 32;
        }

    
    }
}

//An Animated Sprite component, wraps PIXI Animated Sprite object into a usable Game object component
class AnimatedSpriteRenderer extends Component
{

    animatedSprite;
    spriteSheet;

    spriteSheetName;
    currentState;

    poObject;

    tint;

    initalize()
    {
        super.initalize();
        this.spriteSheetName = null;
        this.currentState = null;
        this.poObject = null;
        this.tint = "0xFFFFFF";
    }

    addedToObject(obj)
    {
        super.addedToObject(obj);
        this.spriteSheet = PIXI.Loader.shared.resources[this.spriteSheetName].spritesheet;

        this.animatedSprite = new PIXI.AnimatedSprite(this.spriteSheet.animations[this.currentState]);
        this.animatedSprite.loop = true;

        this.animatedSprite.animationSpeed = 0.167;
        this.width = this.animatedSprite.width;
        this.height = this.animatedSprite.height;
        this.animatedSprite.play();
        this.animatedSprite.tint = parseInt(this.tint);

        TestBedApp.instance.app.stage.addChild(this.animatedSprite);

        this.poObject = obj.getComponentsByType("PositionableObject")[0];
    }

    update(delta)
    {
        this.animatedSprite.x = this.poObject.x;
        this.animatedSprite.y = this.poObject.y;
    }
}