return {
    name: 'mega-script',
    init: ()=>{
        return {
            startPos: 0,
            speed: 0.01,
            rotateY: 0,
        };
    },

    onStart: (gameObject, params) => {
        let renderer = gameObject.GetComponent("renderer");
        renderer.setColor(2,2,0,1);
        gameObject.transform.position[1] = params.startPos;
    },

    onUpdate: (gameObject, params)=>{
        params.rotateY += params.speed;
        gameObject.transform.rotation[1] = params.rotateY;
        gameObject.transform.rotation[0] = params.rotateY;
    },

    onKeyDown: (event, gameObject, params)=>{
        let {data} = event;
        switch(data.key){
            case 'ArrowUp':
                params.speed += 0.005;
                break;
            case 'ArrowDown':
                params.speed -= 0.005;
                break;
            case 'ArrowLeft':
                gameObject.transform.position[0] += 0.05;
                break;
            case 'ArrowRight':
                gameObject.transform.position[0] -= 0.05;
                break;
        }

    }
}