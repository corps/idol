#! /usr/bin/env node
// @flow

import { start } from "./cli";
import {
  build,
  GeneratorAcc,
  GeneratorConfig,
  GeneratorFileContext,
  getMaterialTypeDeconstructor,
  Path,
  TypeDeconstructor
} from "./generators";
import type { Exported, Expression, GeneratorContext } from "./generators";
import { Type } from "./js/schema/Type";
import { Alt, cachedProperty, OrderedObj } from "./functional";
import { Reference } from "./js/schema/Reference";
import * as scripter from "./scripter";

type AM = "b" | "c";
const A: { [k: string]: AM } = {
  A: "b",
  C: "c"
};

export class IdolFlow implements GeneratorContext {
  config: GeneratorConfig;
  state: GeneratorAcc;
  codegenImpl: (IdolFlow, Path, Type) => IdolFlowCodegenFile;
  scaffoldImpl: (IdolFlow, Path, Type) => IdolFlowScaffoldFile;

  constructor(
    config: GeneratorConfig,
    codegenImpl: (IdolFlow, Path, Type) => IdolFlowCodegenFile = (idolFlow, path, type) =>
      new IdolFlowCodegenFile(idolFlow, path, type),
    scaffoldImpl: (IdolFlow, Path, Type) => IdolFlowScaffoldFile = (idolFlow, path, type) =>
      new IdolFlowScaffoldFile(idolFlow, path, type)
  ) {
    this.state = new GeneratorAcc();
    this.config = config;
    this.codegenImpl = codegenImpl;
    this.scaffoldImpl = scaffoldImpl;
  }

  codegenFile(ref: Reference): IdolFlowCodegenFile {
    const path = this.state.reservePath(this.config.pathsOf({ codegen: ref }));
    const type = this.config.params.allTypes.obj[ref.qualified_name];

    return cachedProperty(this, `codegenFile${path.path}`, () =>
      this.codegenImpl(this, path, type)
    );
  }

  scaffoldFile(ref: Reference): IdolFlowScaffoldFile {
    const path = this.state.reservePath(this.config.pathsOf({ scaffold: ref }));
    const type = this.config.params.allTypes.obj[ref.qualified_name];

    return cachedProperty(this, `scaffoldFile${path.path}`, () =>
      this.scaffoldImpl(this, path, type)
    );
  }

  render(): OrderedObj<string> {
    const scaffoldTypes = this.config.params.scaffoldTypes.values();
    scaffoldTypes.forEach((t, i) => {
      const scaffoldFile = this.scaffoldFile(t.named);
      if (!scaffoldFile.declaredType.isEmpty()) {
        // Also add the declared enum
        scaffoldFile.declaredEnum.unwrap();

        console.log(
          `Generated ${scaffoldFile.defaultTypeName} (${i + 1} / ${scaffoldTypes.length})`
        );
      } else {
        console.log(`Skipped ${scaffoldFile.defaultTypeName} (${i + 1} / ${scaffoldTypes.length})`);
      }
    });

    return this.state.render({
      codegen:
        " @flow\nDO NOT EDIT\nThis file was generated by idol_flow, any changes will be overwritten when idol_flow is run again.",
      scaffold:
        " @flow\nThis file was scaffolded by idol_flow.  Feel free to edit as you please.  It can be regenerated by deleting the file and rerunning idol_flow."
    });
  }
}

export class IdolFlowCodegenFile extends GeneratorFileContext<IdolFlow> {
  typeDecon: TypeDeconstructor;
  inputTypeVariant: boolean;

  constructor(idolFlow: IdolFlow, path: Path, type: Type) {
    super(idolFlow, path);
    this.typeDecon = new TypeDeconstructor(type);

    this.reserveIdent(this.defaultTypeName);
    this.reserveIdent(this.defaultEnumName);
    this.reserveIdent(this.defaultFactoryName);
  }

  get defaultTypeName(): string {
    return this.typeDecon.t.named.asQualifiedIdent + "Payload";
  }

  get defaultEnumName(): string {
    return this.typeDecon.t.named.asQualifiedIdent;
  }

  get defaultFactoryName(): string {
    return this.typeDecon.t.named.asQualifiedIdent + "Factory";
  }

  get declaredType(): Alt<Exported> {
    return cachedProperty(this, "declaredType", () => this.enum.bind(e => e.declaredType));
  }

  get declaredEnum(): Alt<Exported> {
    return cachedProperty(this, "declaredEnum", () => this.enum.bind(e => e.declaredEnum));
  }

  get declaredFactory(): Alt<Exported> {
    return cachedProperty(this, "declaredFactory", () => this.enum.bind(e => e.declaredFactory));
  }

  get declaredFactoryTyping(): Alt<Expression> {
    return cachedProperty(this, "declaredFactoryTyping", () =>
      this.declaredType.map(declaredType => (state: GeneratorAcc, path: Path) =>
        `() => ${state.importIdent(path, declaredType)}`
      )
    );
  }

  get enum(): Alt<IdolFlowCodegenEnum> {
    return cachedProperty(this, "enum", () =>
      this.typeDecon.getEnum().map(options => new IdolFlowCodegenEnum(this, options))
    );
  }
}

export class IdolFlowCodegenEnum extends GeneratorFileContext<IdolFlow> {
  options: string[];
  codegenFile: IdolFlowCodegenFile;

  constructor(codegenFile: IdolFlowCodegenFile, options: string[]) {
    super(codegenFile.parent, codegenFile.path);
    this.codegenFile = codegenFile;
    this.options = options;
  }

  get declaredType(): Alt<Exported> {
    return cachedProperty(this, "declaredType", () =>
      Alt.lift(
        this.export(
          this.codegenFile.defaultTypeName,
          scripter.variable(scripter.typeSum(...this.options.map(scripter.literal)), "type"),
          true
        )
      )
    );
  }

  get declaredEnum(): Alt<Exported> {
    return cachedProperty(this, "declaredEnum", () =>
      this.declaredType.map(declaredType =>
        this.export(
          this.codegenFile.defaultEnumName,
          scripter.variable(
            scripter.objLiteral(
              ...this.options.map(option =>
                scripter.propDec(option.toUpperCase(), scripter.literal(option))
              )
            ),
            "const",
            true,
            this.importIdent(declaredType)
          )
        )
      )
    );
  }

  get declaredFactory(): Alt<Exported> {
    return cachedProperty(this, "declaredFactory", () =>
      this.codegenFile.declaredFactoryTyping.map(factoryTyping =>
        this.export(
          this.codegenFile.defaultFactoryName,
          scripter.variable(
            scripter.arrowFunc([], scripter.literal(this.options[0])),
            "const",
            true,
            this.applyExpr(factoryTyping)
          )
        )
      )
    );
  }
}

export class IdolFlowScaffoldFile extends GeneratorFileContext<IdolFlow> {
  typeDecon: TypeDeconstructor;
  type: Type;
  inputTypeVariant: boolean;
  codegenFile: IdolFlowCodegenFile;

  constructor(idolFlow: IdolFlow, path: Path, type: Type) {
    super(idolFlow, path);
    this.typeDecon = getMaterialTypeDeconstructor(idolFlow.config.params.allTypes, type);
    this.type = type;

    this.codegenFile = idolFlow.codegenFile(this.typeDecon.t.named);

    this.reserveIdent(this.defaultTypeName);
    this.reserveIdent(this.defaultEnumName);
  }

  get defaultTypeName(): string {
    return this.type.named.typeName + "Payload";
  }

  get defaultEnumName(): string {
    return this.type.named.typeName;
  }

  get declaredType(): Alt<Exported> {
    return cachedProperty(this, "declaredType", () =>
      this.codegenFile.declaredType.bind(codegenType => {
        return Alt.lift(
          this.export(
            this.defaultTypeName,
            scripter.variable(this.importIdent(codegenType), "type", true),
            true
          )
        );
      })
    );
  }

  get declaredEnum(): Alt<Exported> {
    return cachedProperty(this, "declaredEnum", () =>
      this.codegenFile.declaredEnum.map(codegenEnum =>
        this.export(this.defaultEnumName, scripter.variable(this.importIdent(codegenEnum)))
      )
    );
  }

  get declaredFactoryTyping(): Alt<Expression> {
    return cachedProperty(this, "declaredFactoryTyping", () =>
      this.declaredType.map(declaredType => (state: GeneratorAcc, path: Path) =>
        `() => ${state.importIdent(path, declaredType)}`
      )
    );
  }

  get declaredFactory(): Alt<Exported> {
    return cachedProperty(this, "declaredFactory", () =>
      this.codegenFile.declaredFactory.bind(codegenFactory =>
        this.declaredFactoryTyping.map(factoryTyping =>
          this.export(
            this.defaultEnumName,
            scripter.variable(
              this.importIdent(codegenFactory),
              "const",
              true,
              this.applyExpr(factoryTyping)
            )
          )
        )
      )
    );
  }
}

function main() {
  const params = start({
    flags: {},
    args: {
      target: "idol module names whose contents will have extensible types scaffolded.",
      output: "a directory to generate the scaffolds and codegen into."
    }
  });

  const config = new GeneratorConfig(params);
  config.withPathMappings({
    codegen: config.inCodegenDir(GeneratorConfig.oneFilePerType),
    scaffold: GeneratorConfig.oneFilePerType
  });

  const idolFlow = new IdolFlow(config);
  const moveTo = build(config, idolFlow.render());
  moveTo(params.outputDir);
}

if (require.main === module) {
  main();
}