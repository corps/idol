//  @flow
// DO NOT EDIT
// This file was generated by idol_flow, any changes will be overwritten when idol_flow is run again.;
import type { OptionalMethodPayload as ScaffoldOptionalMethodPayload } from "../../../all/target/OptionalMethod";
import { OptionalMethodFactory as ScaffoldOptionalMethodFactory } from "../../../all/target/OptionalMethod";

export interface AllTargetOptionalServicePayload {
  optional: ScaffoldOptionalMethodPayload;
}
export const AllTargetOptionalServiceFactory: () => AllTargetOptionalServicePayload = () => ({
  optional: ScaffoldOptionalMethodFactory()
});