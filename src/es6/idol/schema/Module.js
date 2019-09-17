// @flow
import { schemaModule } from "./../codegen/schema/Module";
import { OrderedObj } from "../functional";
import { Type } from "./Type";

export class Module extends schemaModule {
    typesAsOrderedObject(): OrderedObj<Type> {
        return OrderedObj.fromIterable(this.types_dependency_ordering.map(name => {
            const type = this.types_by_name[name];
            return new OrderedObj({ [type.qualified_name]: type });
        }))
    }
}
