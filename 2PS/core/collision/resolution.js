import Vector from "../util/vector.js";


export function Resolve(e1, e2, info){
    if(e1.mass == Infinity && e2.mass == Infinity) return false;
    if(info.collide){
        let d = info.depth;
        let n = info.n;
        let p = info.sp;
        if(e1.mass == Infinity && e2.mass == Infinity) return;
        let massProp;
        if(e1.mass < e2.mass){
            massProp = (e1.mass / e2.mass) * 100;
            e1.Translate(n.Scale((d - (d * (massProp / 100)))));
            e2.Translate(n.Scale(-d * (massProp / 100)));
        }
        if(e1.mass > e2.mass){
            massProp = (e2.mass / e1.mass) * 100;
            e2.Translate(n.Scale(-(d - (d * (massProp / 100)))));
            e1.Translate(n.Scale(d * (massProp / 100)));
        }
        if(e1.mass == e2.mass){
            e2.Translate(n.Scale(-d/2));
            e1.Translate(n.Scale(d/2));
        }
        let rA = p.Sub(e1.center);
        let rB = p.Sub(e2.center);
        let wa = e1.angularVelocity;
        let wb = e2.angularVelocity;
        let va = e1.velocity;
        let vb = e2.velocity;
        let e = Math.min(e1.bounce, e2.bounce);
        let vap = va.Add(new Vector(-wa * rA.y, wa * rA.x));
        let vbp = vb.Add(new Vector(-wb * rB.y, wb * rB.x));
        let relVel = vap.Sub(vbp);
        if(Vector.Dot(relVel, n) > 0) return false;
        let j = (-(1 + e) * Vector.Dot(relVel, n)) / (e1.inverseMass + e2.inverseMass + (Vector.Cross(rA, n) ** 2) / e1.inertia + (Vector.Cross(rB, n) ** 2) / e2.inertia);
        let jn = n.Scale(j);
        e1.velocity = e1.velocity.Add(jn.Scale(e1.inverseMass));
        e2.velocity = e2.velocity.Sub(jn.Scale(e2.inverseMass));
        e1.angularVelocity += Vector.Cross(rA, jn.Scale(1 / e1.inertia));
        e2.angularVelocity -= Vector.Cross(rB, jn.Scale(1 / e2.inertia));
        let tangent = n.Scale(-1).Perp();
        let friction = Math.min(e1.friction, e2.friction);
        let j2 = (-(1 + e) * Vector.Dot(relVel, tangent) * friction) / (e1.inverseMass + e2.inverseMass + (Vector.Cross(rA, tangent) ** 2) / e1.inertia + (Vector.Cross(rB, tangent) ** 2) / e2.inertia);
        let jt = tangent.Scale(j2);
        e1.velocity = e1.velocity.Add(jt.Scale(e1.inverseMass));
        e2.velocity = e2.velocity.Sub(jt.Scale(e2.inverseMass));
        e1.angularVelocity += Vector.Cross(rA, jt.Scale(1 / e1.inertia));
        e2.angularVelocity -= Vector.Cross(rB, jt.Scale(1 / e2.inertia));
        return true;
    }
}