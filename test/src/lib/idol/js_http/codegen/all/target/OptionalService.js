// DO NOT EDIT
// This file was generated by idol_js_http, any changes will be overwritten when idol_js_http is run again.;
import { HttpServiceBase } from "../../../service-base";

export class AllTargetOptionalService extends HttpServiceBase {
  optional(args) {
    return this._invoke(
      {
        servicePath: "/optional-service/",
        methodPath: "/optional-method",
        pathMappings: [],
        method: "GET"
      },
      args
    );
  }
}