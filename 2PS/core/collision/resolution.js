import Vector from "../util/vector.js";

export function PositionalCorrection(e1, e2, info) {
    if(e1.isStatic && e2.isStatic) return;
    if(!info.collide) return;

    let correctionPercentage = 0.2;
    let amountToCorrect = info.depth / (e1.inverseMass + e2.inverseMass) * correctionPercentage;
    let correctionVector = info.n.Scale(-amountToCorrect)

    let rigiAMovement = correctionVector.Scale(-e1.inverseMass);
    let rigiBMovement = correctionVector.Scale(e2.inverseMass);


    if(!e1.isStatic){
        e1.Translate(rigiAMovement);
    }
    if(!e2.isStatic){
        e2.Translate(rigiBMovement);
    }

}

export function LinearResolve(e1, e2, info) {
    if(!info.collide) return;

    let depth = info.depth;
    let n = info.n;
    let p = info.sp;

    let relativeVelocity = e2.velocity.Sub(e1.velocity);
    let relativeVelocityAlongNormal = Vector.Dot(relativeVelocity, n.Scale(-1));
    if(relativeVelocityAlongNormal > 0) return;

    if(e1.isStatic && e2.isStatic) return;

    let e = Math.min(e1.bounce, e2.bounce);
    let inverseMassSum = e1.inverseMass + e2.inverseMass;
    let j = -(1 + e) * relativeVelocityAlongNormal;
    j /= inverseMassSum;

    let impulseVector = n.Scale(j);

    let impulseA = impulseVector.Scale(e1.inverseMass);
    let impulseB = impulseVector.Scale(-e2.inverseMass);

    e1.velocity = e1.velocity.Add(impulseA);
    e2.velocity = e2.velocity.Add(impulseB);
}