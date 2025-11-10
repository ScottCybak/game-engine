import { Coordinates } from "coordinates";
import { degreeToRadian } from "degree-to-radian";
import { ObjectBase, ObjectBaseModel } from "object-base";
import { OBJECT_TYPE } from "object-type";

interface PrecomputedCuboid {
    center: Coordinates;
    halfSize: Coordinates;
    inverseRotationMatrix: number[][];
}

export interface CuboidObjectModel extends ObjectBaseModel {
    type: OBJECT_TYPE.CUBOID;
    style?: {
        front?: string;
        back?: string;
        left?: string;
        right?: string;
        top?: string;
        bottom?: string;
    }
}
// https://codepen.io/desandro/pen/bMqZmr (sample/helper)
export class CuboidObject extends ObjectBase<CuboidObjectModel> {

    private precomputedCuboid!: PrecomputedCuboid;

    doesPointIntersect(player: Coordinates): boolean {
        const cuboid = this.precomputedCuboid;
        const local: Coordinates = [
            player[0] - cuboid.center[0],
            player[1] - cuboid.center[1],
            player[2] - cuboid.center[2],
        ];

        // Apply inverse rotation
        const localRotated: Coordinates = [
            local[0] * cuboid.inverseRotationMatrix[0][0] +
            local[1] * cuboid.inverseRotationMatrix[0][1] +
            local[2] * cuboid.inverseRotationMatrix[0][2],
            local[0] * cuboid.inverseRotationMatrix[1][0] +
            local[1] * cuboid.inverseRotationMatrix[1][1] +
            local[2] * cuboid.inverseRotationMatrix[1][2],
            local[0] * cuboid.inverseRotationMatrix[2][0] +
            local[1] * cuboid.inverseRotationMatrix[2][1] +
            local[2] * cuboid.inverseRotationMatrix[2][2],
        ];

        // Inside test
        return (
            Math.abs(localRotated[0]) <= cuboid.halfSize[0] &&
            Math.abs(localRotated[1]) <= cuboid.halfSize[1] &&
            Math.abs(localRotated[2]) <= cuboid.halfSize[2]
        );
    }

    create() {
        const { element, data } = this;
        const { style } = data;
        const common = `position: absolute; transform-origin: left top; border: 1px solid white;`;
        element.innerHTML = `
            <!-- front -->
            <div style="${common}
                width: var(--w);
                height: var(--l);
                transform: translateZ(var(--h));
                ${style?.front ?? ''}
            "></div>

            <!-- back -->
            <div style="${common}
                width: var(--w);
                height: var(--l);
                ${style?.back ?? ''}
            "></div>
            
            <!-- left -->
            <div style="${common}
                width: var(--h);
                height: var(--l);
                transform: rotateY(-90deg);
                ${style?.left ?? ''}
            "></div>

            <!-- right -->
            <div style="${common}
                width: var(--h);
                height: var(--l);
                transform: rotateY(90deg) translate3d(var(--neg-d), 0, var(--w));
                ${style?.right ?? ''}
            "></div>

            <!-- top -->
            <div style="${common}
                width: var(--w);
                height: var(--h);
                transform: rotateX(90deg);
                ${style?.top ?? ''}
            "></div>

            <!-- bottom -->
            <div style="${common}
                height: var(--h);
                width: var(--w);
                transform: rotateX(-90deg) translate3d(0, var(--neg-d), var(--l));
                ${style?.bottom ?? ''}
            "></div>
        `;
        // based on its xyz rotation, create it's point vector and store for later checks
        this.precomputeCuboid(data);

        return this;
    }

    precomputeCuboid(cuboid: CuboidObjectModel): void {
        const [rx, ry, rz] = (cuboid.rotate ?? [0, 0, 0]).map(degreeToRadian);

        const cx = Math.cos(rx), sx = Math.sin(rx);
        const cy = Math.cos(ry), sy = Math.sin(ry);
        const cz = Math.cos(rz), sz = Math.sin(rz);

        // Combined rotation matrix Z * Y * X
        const rot = [
        [cy * cz, cz * sx * sy - cx * sz, sx * sz + cx * cz * sy],
        [cy * sz, cx * cz + sx * sy * sz, cx * sy * sz - cz * sx],
        [-sy,     cy * sx,                cx * cy],
        ];

        // Inverse rotation = transpose
        const inverseRotationMatrix = [
        [rot[0][0], rot[1][0], rot[2][0]],
        [rot[0][1], rot[1][1], rot[2][1]],
        [rot[0][2], rot[1][2], rot[2][2]],
        ];

        const halfSize = cuboid.size.map(s => s / 2) as Coordinates;

        // Offset from center-center-bottom to true center
        const localOffset: Coordinates = [0, 0, halfSize[2]];

        const center: Coordinates = [
            cuboid.position[0] + cuboid.size[0] / 2,
            cuboid.position[1] + cuboid.size[1] / 2,
            cuboid.position[2] + cuboid.size[2] / 2,
        ];

        // Store the precomputed result on the instance
        this.precomputedCuboid = { center, halfSize, inverseRotationMatrix };
    }
    
}