import { ObjectBase } from "object-base";
import { OBJECT_TYPE } from "object-type";
import { CuboidObject, CuboidObjectModel } from "objects/cuboid";
import { GroupObject, GroupObjectModel } from "objects/group";

export type ObjectModel = CuboidObjectModel | GroupObjectModel;

type ObjectClasses = {
    [key in OBJECT_TYPE]: new (data: any) => ObjectBase<any>;
}

export const objectClasses: ObjectClasses = {
    [OBJECT_TYPE.CUBOID]: CuboidObject,
    [OBJECT_TYPE.GROUP]: GroupObject,
}