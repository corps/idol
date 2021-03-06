//  @flow
// DO NOT EDIT
// This file was generated by idol_flow, any changes will be overwritten when idol_flow is run again.
import type { TestsBasicLiteralFivePayload as CodegenTestsBasicLiteralFivePayload } from "./LiteralFive";
import type { TestsBasicLiteralTruePayload as CodegenTestsBasicLiteralTruePayload } from "./LiteralTrue";
import { TestsBasicLiteralTrueFactory as CodegenTestsBasicLiteralTrueFactory } from "./LiteralTrue";
import type { TestsBasicLiteral1Payload as CodegenTestsBasicLiteral1Payload } from "./Literal1";
import { TestsBasicLiteral1Factory as CodegenTestsBasicLiteral1Factory } from "./Literal1";
import type { TestsBasicLiteralThreeOPayload as CodegenTestsBasicLiteralThreeOPayload } from "./LiteralThreeO";
import { TestsBasicLiteralThreeOFactory as CodegenTestsBasicLiteralThreeOFactory } from "./LiteralThreeO";
import type { TestsBasicLiteralHelloPayload as CodegenTestsBasicLiteralHelloPayload } from "./LiteralHello";
import { TestsBasicLiteralHelloFactory as CodegenTestsBasicLiteralHelloFactory } from "./LiteralHello";

export interface TestsBasicTestLiteralStructPayload {
  five: CodegenTestsBasicLiteralFivePayload | null | typeof undefined;
  four: CodegenTestsBasicLiteralTruePayload;
  one: CodegenTestsBasicLiteral1Payload;
  three: CodegenTestsBasicLiteralThreeOPayload;
  two: CodegenTestsBasicLiteralHelloPayload;
}

export const TestsBasicTestLiteralStructFactory: () => TestsBasicTestLiteralStructPayload = () => ({
  five: (() => null)(),
  four: CodegenTestsBasicLiteralTrueFactory(),
  one: CodegenTestsBasicLiteral1Factory(),
  three: CodegenTestsBasicLiteralThreeOFactory(),
  two: CodegenTestsBasicLiteralHelloFactory()
});
