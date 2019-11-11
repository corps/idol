import fetch from "node-fetch";
import { encode as encodeQueryString } from "querystring";

export class HttpServiceBase {
  // Provide a default here for your development, production, or testing needs.
  constructor(urlRoot = "http://your.service.com") {
    this.urlRoot = urlRoot;
  }

  _invoke(methodConfig, args) {
    const { url, body, method, headers } = this._getRequestConfig(
      methodConfig,
      args
    );
    return fetch(url, { method, body, headers });
  }

  _join(a, b) {
    if (a.endsWith("/")) {
      if (b.startsWith("/")) {
        return a + b.slice(1);
      }

      return a + b;
    }

    if (b.startsWith("/")) {
      return a + b;
    }

    return a + "/" + b;
  }

  _getRequestConfig({ servicePath, methodPath, pathMappings, method }, args) {
    let baseUrl = this._join(this.urlRoot, servicePath);

    pathMappings = pathMappings.map(mapping => mapping.split("="));

    const adjustedArgs = typeof args === "object" ? { ...args } : args;

    methodPath = methodPath
      .split("/")
      .map(segment => {
        if (segment.startsWith(":")) {
          if (typeof args !== "object")
            throw new Error(
              "No arguments provided for path parameter " + segment
            );

          segment = segment.slice(1);
          let replacement = args[segment];

          const mapping = pathMappings.find(([param, _]) => param === segment);
          if (mapping) {
            replacement = args;
            for (let attr of mapping[1].split(".")) {
              if (typeof replacement !== "object") {
                throw new Error(
                  "Path mapping " +
                    mapping[1] +
                    " could not find attribute " +
                    attr +
                    " of " +
                    replacement
                );
              }

              replacement = args[attr];
            }
          } else {
            // If this is being used as a path segment, don't include it in the args payload.
            delete adjustedArgs[segment];
          }

          const replacementType = typeof replacement;
          if (!(replacementType === "number" || replacementType === "string")) {
            throw new Error(
              "Path argument " +
                segment +
                " did not result in a string or number, found " +
                replacementType
            );
          }

          return replacement;
        }

        return segment;
      })
      .join("/");

    let url = this._join(baseUrl, methodPath);

    const hasBody = method === "PUT" || method === "POST" || method === "PATCH";

    let headers = {};
    let body = undefined;
    if (hasBody && args) {
      ({ headers, body } = this._serialize(adjustedArgs));
    }

    if (args) {
      url = url + "?" + encodeQueryString(adjustedArgs);
    }

    return {
      url,
      headers,
      body,
      method
    };
  }

  _serialize(args) {
    return {
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    };
  }
}
