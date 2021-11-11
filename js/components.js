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