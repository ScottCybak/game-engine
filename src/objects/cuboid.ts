import { ObjectBase, ObjectBaseModel, XY } from "object-base";
import { OBJECT_TYPE } from "object-type";

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

    doesPointIntersect([x, y]: XY): boolean {
        const { top, left, width, height } = this.limits;
        return (
            x >= left
            && x <= left + width
            && y >= top
            && y <= top + height
        )
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
        return this;
    }
}