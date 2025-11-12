import { Coordinates } from "coordinates";
import { createDiv } from "create-div";

// DEPRECATED

/**
 * this is just me, playing around - leaving this here for now, but i'm
 * marking this as deprecated
 */

export interface SkeletonData {
    height: number;
    head: number;
    neckHeight: number;
    shoulderWidth: number;
    torsoHeight: 20,
    hipWidth: number;
    upperArmLength: number;
    lowerArmLength: number;
    hands: number;
    upperLegLength: number;
    lowerLegLength: number;
    foot: number;
}

export const sampleSkeleton: SkeletonData = {
    height: 76,
    head: 12,
    neckHeight: 5,
    shoulderWidth: 20,
    torsoHeight: 20,
    hipWidth: 14,
    upperArmLength: 11,
    lowerArmLength: 11,
    hands: 8,
    upperLegLength: 20,
    lowerLegLength: 18,
    foot: 10,
}

let autoId = 1;

export class Skeleton {

    private sourceElement!: HTMLElement;

    constructor(
        private data: SkeletonData,
        private position: Coordinates,
        private scale: number = 1,
    ) {
        this.create();
    }

    create() {
        const { data: { shoulderWidth, hipWidth, head, torsoHeight, upperLegLength, lowerLegLength, lowerArmLength, upperArmLength, neckHeight }, position, scale } = this;
        const sourceElement = this.sourceElement = createDiv(`skeleton-${autoId++}`);
        sourceElement.classList.add('skeleton');
        sourceElement.style.cssText = `
            position: absolute;
            top: ${position[0]}px;
            left: ${position[1]}px;
            transform-style: preserve-3d;
            transform: rotateX(-90deg);
        `
        const skeletonElement = createDiv();
        skeletonElement.style.cssText = `position: absolute; transform: translateZ(1px)`;
        
        const biggerWidth = Math.max(shoulderWidth, hipWidth);
        const shoulderLeft = {
            x: biggerWidth === shoulderWidth ? 0 : ((hipWidth - shoulderWidth) / 2),
            y: (head + neckHeight),
        };
        const shoulderRight = {
            x: shoulderLeft.x + shoulderWidth,
            y: shoulderLeft.y,
        };
        const neckBottom = {
            x: shoulderRight.x - shoulderWidth / 2,
            y: shoulderLeft.y,
        };
        const neckTop = {
            x: neckBottom.x,
            y: neckBottom.y - neckHeight,
        };
        const hipLeft = {
            x: biggerWidth === hipWidth ? 0 : (shoulderWidth - hipWidth) / 2,
            y: head + neckHeight + torsoHeight,
        };
        const hipRight = {
            x: hipLeft.x + hipWidth,
            y: hipLeft.y,
        };
        const leftKnee = {
            x: hipLeft.x - 1,
            y: hipLeft.y + upperLegLength,
        };
        const leftAnkle = {
            x: hipLeft.x,
            y: leftKnee.y + lowerLegLength,
        };
        const rightKnee = {
            x: hipRight.x + 1,
            y: leftKnee.y,
        };
        const rightAnkle = {
            x: hipRight.x,
            y: leftAnkle.y,
        };
        const leftElbow = {
            x: shoulderLeft.x - 2,
            y: shoulderLeft.y + upperArmLength,
        };
        const rightElbow = {
            x: shoulderRight.x + 2,
            y: shoulderRight.y + upperArmLength,
        };
        const leftWrist = {
            x: leftElbow.x,
            y: leftElbow.y + lowerArmLength,
        };
        const rightWrist = {
            x: rightElbow.x,
            y: rightElbow.y + lowerArmLength,
        };
        
        const dots = {
            shoulderLeft,
            shoulderRight,
            neckTop,
            neckBottom,
            hipLeft,
            hipRight,
            leftKnee,
            leftAnkle,
            rightKnee,
            rightAnkle,
            leftElbow,
            rightElbow,
            leftWrist,
            rightWrist,
        };
        // draw all the dots
        Object.values(dots).forEach(pos => skeletonElement.appendChild(this.createDot(pos)));

        [
            [dots.shoulderLeft, dots.shoulderRight],
            [dots.shoulderLeft, dots.hipLeft],
            [dots.shoulderRight, dots.hipRight],
            [dots.hipLeft, dots.hipRight],
            [dots.hipLeft, dots.leftKnee],
            [dots.hipRight, dots.rightKnee],
            [dots.leftKnee, dots.leftAnkle],
            [dots.rightKnee, dots.rightAnkle],
            [dots.shoulderLeft, dots.leftElbow],
            [dots.shoulderRight, dots.rightElbow],
            [dots.leftElbow, dots.leftWrist],
            [dots.rightElbow, dots.rightWrist],
            [dots.neckTop, dots.neckBottom],
        ].forEach(([a, b]) => {
            console.log('draw', a, b);
            skeletonElement.appendChild(this.createLine(a, b));
        });
        
        console.log('seeded with', this.data);
        sourceElement.appendChild(skeletonElement);
        return this;
    }

    private createLine(a: {x: number, y: number}, b: {x: number, y: number}, color = 'magenta') {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const div = createDiv();
        div.style.cssText = `
            position: absolute;
            top: ${a.y - 1.5}px;
            left: ${a.x + 1.5}px;
            width: ${length}px;
            height: 0;
            border-top: 3px solid ${color};
            transform-origin: 0 0;
            transform: rotate(${angle}rad);
            z-index: 0;
        `;
        return div;
    }

    private createDot({x, y}: {x: number, y: number}, diameter = 5, color = "white") {
        const div = createDiv();
        div.style.cssText = `
            position: absolute;
            width: ${diameter}px;
            height: ${diameter}px;
            border-radius: 50%;
            background: ${color};
            top: ${y - diameter / 2}px;
            left: ${x - diameter / 2}px;
            z-index: 1;
        `;
        return div;
    }

    appendTo(hostElement: HTMLElement) {
        hostElement.appendChild(this.sourceElement);
        return this;
    }

}