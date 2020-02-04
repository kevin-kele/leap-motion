import { getCoords } from './function.js'

import { canvas, ctx } from './canvas.js'
import { buffer, bufferCtx } from './canvas.js'

/**
 * Leap Motion
 */

let lastPointDrawn = null;

const controller = new Leap.Controller();
controller.connect(); // Ouvre la connexion WebSocket

controller.on('frame', (frame) => {
    // Efface le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pour chaque main
    frame.hands.forEach((hand) => {
        // Dessin de la paume
        const palmPos = getCoords(hand.palmPosition, frame, canvas);
        ctx.fillRect(palmPos.x, palmPos.y, 25, 25);

        //dessin de poignet
        ctx.fillStyle = 'black';
        let nextJoint = getCoords(hand.arm.nextJoint, frame, canvas);
        ctx.fillRect(nextJoint.x, nextJoint.y, 25, 25);

        // Dessin des doigts
        const carps = [];
        const mcps = [];
        hand.fingers.forEach((finger) => {
            // Pour chaque doigt, dessin des différentes phalanges …
            const tip = getCoords(finger.tipPosition, frame, canvas);
            const dip = getCoords(finger.dipPosition, frame, canvas);
            const pip = getCoords(finger.pipPosition, frame, canvas);
            const mcp = getCoords(finger.mcpPosition, frame, canvas);
            const carp = getCoords(finger.carpPosition, frame, canvas);

            ctx.fillStyle = 'red';
            const pos = [tip, dip, pip, mcp, carp, ]
            for (let i = 0; i < pos.length - 1; i++) {
                ctx.fillRect(pos[i].x, pos[i].y, 10, 10);
                ctx.beginPath();
                ctx.moveTo(pos[i].x, pos[i].y);
                ctx.lineTo(pos[i + 1].x, pos[i + 1].y);
                ctx.closePath();

                ctx.beginPath();
                ctx.moveTo(pos[i].x, pos[i].y);
                ctx.lineTo(pos[i + 1].x, pos[i + 1].y);
                ctx.stroke();
                ctx.closePath();
            }
            ctx.fillRect(carp.x, carp.y, 10, 10);

            carps.push(carp);
            mcps.push(mcp);
        });



        ctx.beginPath();
        ctx.moveTo(carps[0].x, carps[0].y);
        for (let k = 1; k < carps.length; k++) {
            ctx.lineTo(carps[k].x, carps[k].y);
        }
        ctx.stroke();
        ctx.closePath();


        ctx.beginPath();
        ctx.moveTo(mcps[1].x, mcps[1].y);
        for (let k = 2; k < mcps.length; k++) {
            ctx.lineTo(mcps[k].x, mcps[k].y);
        }
        ctx.stroke();
        ctx.closePath();



        console.log(hand.pinchStrength); // entre 0 et 1

        if (hand.pinchStrength >= 0.95) {
            let indexFinger = getCoords(hand.indexFinger.tipPosition, frame, canvas);

            if (lastPointDrawn !== null) {
                bufferCtx.beginPath();
                bufferCtx.moveTo(lastPointDrawn.x, lastPointDrawn.y);
                bufferCtx.lineTo(indexFinger.x, indexFinger.y);
                bufferCtx.stroke();
                bufferCtx.closePath();
            }
            lastPointDrawn = indexFinger;
        } else {
            lastPointDrawn = null;
        }
    }); //  fin de ma boucle 


    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);


});