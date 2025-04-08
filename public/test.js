export const testScript = {
    init: ()=>{
        return {
            x: 0
        };
    },

    onStart: (gameObject) => {
        let renderer = gameObject.GetComponent("renderer");
        renderer.setColor(0.6,0.6,0,1);
    },

    onUpdate: (gameObject, params)=>{
        params.x += 0.01;
        gameObject.transform.position[1] = Math.sin(params.x);
    }
    
}