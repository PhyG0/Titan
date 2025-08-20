import Vector from "../util/vector.js";

export function PositionalCorrection(e1, e2, info) {
    if(e1.isStatic && e2.isStatic) return;
    if(!info.collide) return;

    let correctionPercentage = 0.3;
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

    if(e1.isStatic && e2.isStatic) return;    

    let depth = info.depth;
    let n = info.n;
    let p = info.sp;

    let relativeVelocity = e2.velocity.Sub(e1.velocity);
    let relativeVelocityAlongNormal = Vector.Dot(relativeVelocity, n.Scale(-1));
    if(relativeVelocityAlongNormal > 0) return;


    let e = (2 * e1.bounce * e2.bounce) / (e1.bounce + e2.bounce)
    let inverseMassSum = e1.inverseMass + e2.inverseMass;
    let j = -(1 + e) * relativeVelocityAlongNormal;
    j /= inverseMassSum;

    let impulseVector = n.Scale(j);

    let impulseA = impulseVector.Scale(e1.inverseMass);
    let impulseB = impulseVector.Scale(-e2.inverseMass);

    e1.velocity = e1.velocity.Add(impulseA);
    e2.velocity = e2.velocity.Add(impulseB);
}



// export function Resolve(e1, e2, info) {
//     if (!info.collide) return;
//     if (e1.isStatic && e2.isStatic) return;

//     let p = info.sp;   
//     let n = info.n;  

//     // Vectors from centers to contact point
//     let rA = p.Sub(e1.center);
//     let rB = p.Sub(e2.center);

//     // Tangential velocity from rotation
//     let vRotA = new Vector(-e1.angularVelocity * rA.y, e1.angularVelocity * rA.x);
//     let vRotB = new Vector(-e2.angularVelocity * rB.y, e2.angularVelocity * rB.x);

//     // Linear + angular velocities
//     let vA = e1.velocity.Add(vRotA);
//     let vB = e2.velocity.Add(vRotB);

//     // Relative velocity
//     let relVel = vB.Sub(vA);
//     let velAlongNormal = Vector.Dot(relVel, n);

//     // If separating, no impulse
//     if (velAlongNormal < 0) return;   

//     // Restitution
//     let e = (2 * e1.bounce * e2.bounce) / (e1.bounce + e2.bounce)

//     // Cross products (2D scalar)
//     let rAn = Vector.Cross(rA, n);
//     let rBn = Vector.Cross(rB, n);

//     // Effective mass term
//     let invMassSum = e1.inverseMass + e2.inverseMass;
//     let crossSum = (rAn * rAn) * e1.inverseInertia + (rBn * rBn) * e2.inverseInertia;

//     // Impulse scalar
//     let j = (1 + e) * velAlongNormal; 
//     j /= (invMassSum + crossSum);

//     // Impulse vector
//     let impulse = n.Scale(j);

//     // Apply impulses
//     e1.velocity = e1.velocity.Add(impulse.Scale(e1.inverseMass));   
//     e2.velocity = e2.velocity.Sub(impulse.Scale(e2.inverseMass));  

//     // Apply angular impulses
//     e1.angularVelocity += rAn * j * e1.inverseInertia;  
//     e2.angularVelocity -= rBn * j * e2.inverseInertia;  
// }

export function Resolve(e1, e2, info) {
    if (!info.collide) return;
    if (e1.isStatic && e2.isStatic) return;

    let p = info.sp;
    let n = info.n;
    
    // Vectors from centers to contact point
    let rA = p.Sub(e1.center);
    let rB = p.Sub(e2.center);

    // Tangential velocity from rotation
    let vRotA = new Vector(-e1.angularVelocity * rA.y, e1.angularVelocity * rA.x);
    let vRotB = new Vector(-e2.angularVelocity * rB.y, e2.angularVelocity * rB.x);

    // Linear + angular velocities
    let vA = e1.velocity.Add(vRotA);
    let vB = e2.velocity.Add(vRotB);

    // Relative velocity
    let relVel = vB.Sub(vA);
    let velAlongNormal = Vector.Dot(relVel, n);

    // If separating, no impulse
    if (velAlongNormal < 0) return;

    // Restitution
    let e = Math.min(e1.bounce, e2.bounce); // Changed to min like the friction example

    // Cross products (2D scalar)
    let rAn = Vector.Cross(rA, n);
    let rBn = Vector.Cross(rB, n);

    // Effective mass term
    let invMassSum = e1.inverseMass + e2.inverseMass;
    let crossSum = (rAn * rAn) * e1.inverseInertia + (rBn * rBn) * e2.inverseInertia;

    // Impulse scalar
    let j = (1 + e) * velAlongNormal;
    j /= (invMassSum + crossSum);

    // Impulse vector
    let impulse = n.Scale(j);

    // Apply impulses
    e1.velocity = e1.velocity.Add(impulse.Scale(e1.inverseMass));
    e2.velocity = e2.velocity.Sub(impulse.Scale(e2.inverseMass));

    // Apply angular impulses
    e1.angularVelocity += rAn * j * e1.inverseInertia;
    e2.angularVelocity -= rBn * j * e2.inverseInertia;

    // FRICTION IMPLEMENTATION
    // Calculate tangent direction (perpendicular to normal)
    let velocityInNormalDirection = n.Scale(Vector.Dot(relVel, n));
    let tangent = relVel.Sub(velocityInNormalDirection);
    tangent = tangent.Scale(-1); // Friction opposes relative motion
    
    let minFriction = (2 * e1.friction * e2.friction) / (e1.friction + e2.friction)
    
    // Only apply friction if there's tangential motion
    if (tangent.Length() > 0.00001) {
        tangent = tangent.Unit();
        
        // Cross products for tangent direction
        let rAt = Vector.Cross(rA, tangent);
        let rBt = Vector.Cross(rB, tangent);
        
        // Effective mass for tangential direction
        let crossSumTangent = (rAt * rAt) * e1.inverseInertia + (rBt * rBt) * e2.inverseInertia;
        
        // Friction impulse magnitude
        let frictionImpulse = -(1 + e) * Vector.Dot(relVel, tangent) * minFriction;
        frictionImpulse /= (invMassSum + crossSumTangent);
        
        // Clamp friction impulse to not exceed normal impulse (Coulomb friction)
        if (frictionImpulse > j) {
            frictionImpulse = j;
        }
        
        // Friction impulse vector
        let frictionImpulseVector = tangent.Scale(frictionImpulse);
        
        // Apply friction impulses to linear velocity
        e1.velocity = e1.velocity.Sub(frictionImpulseVector.Scale(e1.inverseMass));
        e2.velocity = e2.velocity.Add(frictionImpulseVector.Scale(e2.inverseMass));
        
        // Apply friction impulses to angular velocity
        e1.angularVelocity -= rAt * frictionImpulse * e1.inverseInertia;
        e2.angularVelocity += rBt * frictionImpulse * e2.inverseInertia;
    }
}

// export function Resolve(e1, e2, info) {
//     if (!info.collide) return;
//     if (e1.isStatic && e2.isStatic) return;

//     let p = info.sp;
//     let n = info.n;
    
//     // Vectors from centers to contact point
//     let rA = p.Sub(e1.center);
//     let rB = p.Sub(e2.center);

//     // Tangential velocity from rotation
//     let vRotA = new Vector(-e1.angularVelocity * rA.y, e1.angularVelocity * rA.x);
//     let vRotB = new Vector(-e2.angularVelocity * rB.y, e2.angularVelocity * rB.x);

//     // Linear + angular velocities
//     let vA = e1.velocity.Add(vRotA);
//     let vB = e2.velocity.Add(vRotB);

//     // Relative velocity
//     let relVel = vB.Sub(vA);
//     let velAlongNormal = Vector.Dot(relVel, n);

//     // If separating, no impulse
//     if (velAlongNormal < 0) return;

//     // Restitution
//     let e = (2 * e1.bounce * e2.bounce) / (e1.bounce + e2.bounce)

//     // Cross products (2D scalar)
//     let rAn = Vector.Cross(rA, n);
//     let rBn = Vector.Cross(rB, n);

//     // Effective mass term
//     let invMassSum = e1.inverseMass + e2.inverseMass;
//     let crossSum = (rAn * rAn) * e1.inverseInertia + (rBn * rBn) * e2.inverseInertia;

//     // Impulse scalar
//     let j = (1 + e) * velAlongNormal;
//     j /= (invMassSum + crossSum);

//     // Impulse vector
//     let impulse = n.Scale(j);

//     // Apply impulses
//     e1.velocity = e1.velocity.Add(impulse.Scale(e1.inverseMass));
//     e2.velocity = e2.velocity.Sub(impulse.Scale(e2.inverseMass));

//     // Apply angular impulses
//     e1.angularVelocity += rAn * j * e1.inverseInertia;
//     e2.angularVelocity -= rBn * j * e2.inverseInertia;

//     // FRICTION IMPLEMENTATION
//     // Calculate tangent direction (perpendicular to normal)
//     let velocityInNormalDirection = n.Scale(Vector.Dot(relVel, n));
//     let tangent = relVel.Sub(velocityInNormalDirection);
    
//     let minFriction = (2 * e1.friction * e2.friction) / (e1.friction + e2.friction)
    
//     // Only apply friction if there's significant tangential motion
//     let tangentMagnitude = tangent.Length();
//     if (tangentMagnitude > 0.001) { 
//         tangent = tangent.Scale(-1 / tangentMagnitude); 
        
//         // Cross products for tangent direction
//         let rAt = Vector.Cross(rA, tangent);
//         let rBt = Vector.Cross(rB, tangent);
        
//         // Effective mass for tangential direction
//         let crossSumTangent = (rAt * rAt) * e1.inverseInertia + (rBt * rBt) * e2.inverseInertia;
        
//         let tangentialVelocity = Vector.Dot(relVel, tangent);
//         let frictionImpulse = -tangentialVelocity;
//         frictionImpulse /= (invMassSum + crossSumTangent);
        
//         let maxFrictionImpulse = minFriction * Math.abs(j);
//         frictionImpulse = Math.max(-maxFrictionImpulse, Math.min(maxFrictionImpulse, frictionImpulse));
        
//         // Friction impulse vector
//         let frictionImpulseVector = tangent.Scale(frictionImpulse);
        
//         // Apply friction impulses to linear velocity
//         e1.velocity = e1.velocity.Sub(frictionImpulseVector.Scale(e1.inverseMass));
//         e2.velocity = e2.velocity.Add(frictionImpulseVector.Scale(e2.inverseMass));
        
//         // Apply friction impulses to angular velocity
//         e1.angularVelocity -= rAt * frictionImpulse * e1.inverseInertia;
//         e2.angularVelocity += rBt * frictionImpulse * e2.inverseInertia;
//     }
// }
