export type Some<T> = T | T[];
export type Maybe<T> = T | T[];
export type FieldDef = Some<string>

export class ModelDef {
  resident_values: string[] = [];
  is_a: string = "";
  fields: { [k: string]: FieldDef } = {};
  consts: any = {};
  docs: string = "";
}

export type ModuleDef = { [k: string]: ModelDef }
