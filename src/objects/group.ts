import { Coordinates } from "coordinates";
import { ObjectBase, ObjectBaseModel } from "object-base";
import { objectClasses, ObjectModel } from "object-classes";
import { OBJECT_TYPE } from "object-type";

export interface GroupObjectModel extends ObjectBaseModel {
    type: OBJECT_TYPE.GROUP;
    objects: ObjectModel[];
}

export class GroupObject extends ObjectBase<GroupObjectModel> {

    private loadedObjects: ObjectBase<any>[] = [];
    
    doesPointIntersect(point: Coordinates, radius: number): boolean {
        // subtract the data.position.x|y from our point...
        const adjustedPoint: Coordinates = [
            point[0] - this.data.position[0],
            point[1] - this.data.position[1],
            point[2],
        ]
        // if the group is rotated, it might muck things up...
        return this.loadedObjects.some(o => o.doesPointIntersect(adjustedPoint, radius));
    }
    

    create(): this {
        this.createObjects(this.data.objects, this.element);
        return this;
    }

    // this is similar to the world method
    // consider splitting to avoid duplication
    private createObjects(objects: ObjectModel[], container: HTMLElement) {
        const { loadedObjects } = this;
        objects.forEach(o => {
            const Klass = objectClasses[o.type];
            if (Klass) {
                const instance = new Klass(o).create().place(container);
                loadedObjects.push(instance);
            } else {
                console.warn('no class found', o);
            }
        })
    }
}