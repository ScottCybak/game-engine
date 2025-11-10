import { Coordinates } from "coordinates";

export interface ObjectBaseModel {
    position: Coordinates;
    size: Coordinates;
    rotate?: Coordinates;
}

interface Box {
    top: number;
    left: number;
    width: number;
    height: number;
    center: [number, number];
}

const defaultBox: Box = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    center: [0, 0],
}

export type XY = [number /* centerX */, number /* centerY */];

export abstract class ObjectBase<T extends ObjectBaseModel> {

    abstract create(): this
    
    protected element = document.createElement('div');

    limits: Box = { ...defaultBox };
    
    constructor(protected readonly data: T) {
        const [x, y, z] = data.position;
        const [width, height, depth] = data.size;
        const [rx, ry, rz] = data.rotate ?? [0, 0, 0];
        const { element } = this;
        element.classList.add('object', `object-${(data as any).type}`);
        element.style.cssText = `
            --x: ${x}px;
            --y: ${y}px;
            --z: ${z}px;
            --w: ${width}px;
            --l: ${height}px;
            --h: ${depth}px;
            --neg-d: ${-depth}px;
            --r-x: ${rx}deg;
            --r-y: ${ry}deg;
            --r-z: ${rz}deg;
        `;

        this.limits = {
            left: x,
            top: y,
            width,
            height,
            center: [x + (width / 2), y + (height / 2)]
        }
    }

    recalculate([centerX, centerY]: XY) {
        // const e = this.element;
        // const originX = 50 + (100 - (Math.round(this.limits.center[0] / centerX * 100000) / 1000)) * 25;
        // const originY = 50 + (100 - (Math.round(this.limits.center[1] / centerY * 100000) / 1000)) * 25;
        // e.style.setProperty('-webkit-perspective-origin-x', `${originX}%`);
        // e.style.setProperty('-webkit-perspective-origin-y', `${originY}%`);
    }

    abstract doesPointIntersect(point: Coordinates): boolean;

    place(appendAsChildTo: HTMLElement) {
        appendAsChildTo.appendChild(this.element);
        return this;
    }
}