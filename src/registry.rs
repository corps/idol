use crate::dep_mapper::DepMapper;
use crate::models::declarations::*;
use crate::schema::*;
use regex::Regex;
use std::collections::HashMap;
use std::collections::HashSet;
use std::error::Error;
use std::fmt::Display;

#[derive(Debug, PartialEq)]
pub enum FieldDecError {
    LiteralParseError(String),
    UnknownPrimitiveType(String),
    InvalidParameter(String),
    UnspecifiedType,
    LiteralAnyError,
    LiteralInStructError,
}

#[derive(Debug, PartialEq)]
pub enum TypeDecError {
    FieldError(String, FieldDecError),
    BadFieldNameError(String),
    IsAError(FieldDecError),
}

#[derive(Debug, PartialEq)]
pub enum ModuleError {
    TypeDecError(String, TypeDecError),
    GenericTypeError(String, String),
    BadTypeNameError(String),
    CircularDependency(String),
}

#[derive(Debug, PartialEq)]
pub enum ProcessingError {
    ModuleError(String, ModuleError),
    BadModuleNameError(String),
    CircularImportError(String),
    CircularTypeError(String),
    DuplicateImportError(String),
}

impl From<serde_json::Error> for FieldDecError {
    fn from(e: serde_json::Error) -> FieldDecError {
        FieldDecError::LiteralParseError(e.description().to_string())
    }
}

impl Display for ProcessingError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        (match self {
            ProcessingError::ModuleError(m, err) => write!(f, "module {}: {}", m, err),
            ProcessingError::BadModuleNameError(m) => write!(f, "module {}: invalid name", m),
            ProcessingError::CircularImportError(desc) => {
                write!(f, "circular module dependency found: {}", desc)
            }
            ProcessingError::CircularTypeError(desc) => write!(
                f,
                "circular dependency found via an abstract type: {}",
                desc
            ),
            ProcessingError::DuplicateImportError(m) => write!(
                f,
                "module {}: process_module was called twice for same module!",
                m
            ),
        })
    }
}

impl Display for ModuleError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        (match self {
            ModuleError::TypeDecError(m, err) => write!(f, "declaration {}: {}", m, err),
            ModuleError::BadTypeNameError(m) => write!(f, "declaration {}", m),
            ModuleError::CircularDependency(msg) => {
                write!(f, "circular dependency between declarations: {}", msg)
            }
            ModuleError::GenericTypeError(m, msg) => {
                write!(f, "problem with generic resolution of {}: {}", m, msg)
            }
        })
    }
}

impl Display for TypeDecError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        (match self {
            TypeDecError::FieldError(field, err) => write!(f, "field {}: {}", field, err),
            TypeDecError::IsAError(err) => write!(f, "{}", err),
            TypeDecError::BadFieldNameError(field) => write!(f, "field {}: invalid name", field),
        })
    }
}

impl Display for FieldDecError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        (match self {
            FieldDecError::LiteralParseError(field) => {
                write!(f, "problem parsing literal value for field {}", field)
            }
            FieldDecError::UnknownPrimitiveType(msg) => {
                write!(f, "unknown primitive type: {}", msg)
            }
            FieldDecError::UnspecifiedType => write!(f, "type was unspecified"),
            FieldDecError::LiteralAnyError => write!(f, "literal field cannot be 'any' type"),
            FieldDecError::InvalidParameter(s) => {
                write!(f, "field includes an invalid type parameter: {}", s)
            },
            FieldDecError::LiteralInStructError => write!(f, "literals in fields must be wrapped in a type alias.  Use is_a and create a new type to wrap the literal.")
        })
    }
}

#[derive(Debug)]
pub struct SchemaRegistry {
    pub modules: HashMap<String, Module>,
    pub missing_module_lookups: HashSet<String>,
    pub missing_type_lookups: HashMap<Reference, Reference>,
    pub unresolved_abstractions: HashMap<Reference, HashSet<Reference>>,
    pub module_dep_mapper: DepMapper,
    pub type_dep_mapper: DepMapper,
}

impl SchemaRegistry {
    pub fn from_modules(modules: HashMap<String, Module>) -> SchemaRegistry {
        SchemaRegistry {
            modules,
            missing_module_lookups: HashSet::new(),
            missing_type_lookups: HashMap::new(),
            unresolved_abstractions: HashMap::new(),
            module_dep_mapper: DepMapper::new(),
            type_dep_mapper: DepMapper::new(),
        }
    }

    fn remove_resolved_missing_dependencies(
        &mut self,
        module_name: &String,
    ) -> Result<(), ProcessingError> {
        let module = self.modules.get(module_name).unwrap();

        for type_name in module.types_by_name.keys() {
            let reference =
                Reference::from(format!("{}.{}", module.module_name, type_name).as_str());
            self.missing_type_lookups.remove(&reference);
        }

        Ok(())
    }

    fn resolve_dependent_abstractions(
        &mut self,
        module_name: &String,
    ) -> Result<(), ProcessingError> {
        let module = self.modules.get(module_name).unwrap();
        let new_abstract_types = module.abstract_types_by_name.to_owned();
        let mut resolved_abstraction_modules: HashSet<String> = HashSet::new();

        for (type_name, abstract_type) in new_abstract_types.iter() {
            let abstract_reference =
                Reference::from(format!("{}.{}", module_name, type_name).as_str());

            if let Some(abstraction_references) =
                self.unresolved_abstractions.remove(&abstract_reference)
            {
                for abstraction_reference in abstraction_references.iter() {
                    let abstraction = self.resolve(abstraction_reference).unwrap();

                    let new_type = SchemaRegistry::create_concrete_from(
                        abstraction,
                        abstraction_reference,
                        abstract_type,
                    )?;

                    let abstraction_module_resolver =
                        ModuleResolver(abstraction_reference.module_name.to_owned());
                    let abstraction_module = self
                        .modules
                        .get_mut(&abstraction_reference.module_name)
                        .unwrap();

                    SchemaRegistry::add_type_and_replace_dependencies(
                        abstraction_module,
                        &abstraction_module_resolver,
                        new_type,
                    )
                    .map_err(|e| {
                        ProcessingError::ModuleError(abstraction_module.module_name.to_owned(), e)
                    })?;

                    resolved_abstraction_modules
                        .insert(abstraction_reference.module_name.to_owned());
                }
            }
        }

        // Recalculate any dependencies in need of resolving after pulling the abstraction in.
        for module_name in resolved_abstraction_modules {
            self.process_dependencies(&module_name)?;
        }

        Ok(())
    }

    fn process_dependencies(&mut self, module_name: &String) -> Result<(), ProcessingError> {
        self.check_circular_dependencies(module_name)?;
        self.process_local_abstractions(module_name)?;
        self.add_missing_lookups(module_name)?;

        Ok(())
    }

    fn create_concrete_from(
        abstraction: &Type,
        abstraction_reference: &Reference,
        abstract_type: &Type,
    ) -> Result<Type, ProcessingError> {
        let new_type = abstraction
            .resolve_abstraction(abstract_type)
            .map_err(|msg| {
                ProcessingError::ModuleError(
                    abstraction_reference.module_name.to_owned(),
                    ModuleError::GenericTypeError(abstraction_reference.type_name.to_owned(), msg),
                )
            })?;

        Ok(new_type)
    }

    fn process_local_abstractions(&mut self, module_name: &String) -> Result<(), ProcessingError> {
        let module = self.modules.get(module_name).unwrap();
        let dependencies = module.dependencies.to_owned();
        let mut new_types: Vec<(Type, &Reference)> = vec![];

        for dep in dependencies.iter() {
            if dep.is_abstraction {
                if let Some(abstract_type) = self.resolve_abstract_type(&dep.to) {
                    let abstraction = self.resolve(&dep.from).unwrap();

                    new_types.push((
                        SchemaRegistry::create_concrete_from(
                            abstraction,
                            &dep.from,
                            abstract_type,
                        )?,
                        &dep.from,
                    ));
                } else {
                    self.unresolved_abstractions
                        .entry(dep.to.clone())
                        .or_default()
                        .insert(dep.from.clone());
                }
            }
        }

        let module = self.modules.get_mut(module_name).unwrap();
        for (new_type, abstraction_reference) in new_types {
            let abstraction_module_resolver =
                ModuleResolver(abstraction_reference.module_name.to_owned());

            SchemaRegistry::add_type_and_replace_dependencies(
                module,
                &abstraction_module_resolver,
                new_type,
            )
            .map_err(|e| ProcessingError::ModuleError(module.module_name.to_owned(), e))?;
        }

        Ok(())
    }

    fn add_missing_lookups(&mut self, module_name: &String) -> Result<(), ProcessingError> {
        let module = self.modules.get(module_name).unwrap();

        for dep in module.dependencies.iter() {
            if !self.modules.contains_key(&dep.to.module_name) {
                self.missing_module_lookups
                    .insert(dep.to.module_name.clone());
            }

            if !dep.is_abstraction {
                if self.resolve(&dep.to).is_none() {
                    self.missing_type_lookups
                        .insert(dep.to.to_owned(), dep.from.to_owned());
                }
            }
        }

        Ok(())
    }

    fn check_circular_dependencies(&mut self, module_name: &String) -> Result<(), ProcessingError> {
        let module = self.modules.get(module_name).unwrap();

        for dep in module.dependencies.iter() {
            // Check for cicular dependencies.  For local dependencies, the local ordering has already
            // performed this check, so we can ignore duplicating effort.
            if !dep.is_local {
                // Check for circular imports caused by the concrete types.
                // A circular module import is ok if it is only caused by abstract dependencies, which
                // will not be included in output.
                if !dep.is_abstraction {
                    self.module_dep_mapper
                        .add_dependency(
                            dep.from.module_name.to_owned(),
                            dep.to.module_name.to_owned(),
                        )
                        .map_err(|msg| ProcessingError::CircularImportError(msg))?;
                }

                // Abstract types can also cause circular dependencies in the output.
                // These circular dependencies won't be caught by the local check or the module checker,
                // since normally a modular level circular dependency via abstract types is not an issue
                // for the output.
                self.type_dep_mapper
                    .add_dependency(
                        dep.from.qualified_name.to_owned(),
                        dep.to.qualified_name.to_owned(),
                    )
                    .map_err(|msg| ProcessingError::CircularTypeError(msg))?;
            }
        }

        Ok(())
    }

    pub fn process_module(
        &mut self,
        module_name: String,
        module_dec: &ModuleDec,
    ) -> Result<(), ProcessingError> {
        if self.modules.contains_key(&module_name) {
            return Err(ProcessingError::DuplicateImportError(
                module_name.to_owned(),
            ));
        }

        let mut module = Module::default();
        module.module_name = module_name.to_owned();

        SchemaRegistry::add_types_to_module(&mut module, module_dec)
            .map_err(|e| ProcessingError::ModuleError(module_name.to_owned(), e))?;
        module.order_local_dependencies().map_err(|m| {
            ProcessingError::ModuleError(module_name.to_owned(), ModuleError::CircularDependency(m))
        })?;

        self.missing_module_lookups.remove(&module_name);
        self.modules.insert(module.module_name.to_owned(), module);

        self.process_dependencies(&module_name)?;
        self.resolve_dependent_abstractions(&module_name)?;
        self.remove_resolved_missing_dependencies(&module_name)?;

        Ok(())
    }

    pub fn resolve(&self, model_reference: &Reference) -> Option<&Type> {
        self.modules
            .get(&model_reference.module_name)
            .and_then(|module| module.types_by_name.get(&model_reference.type_name))
    }

    pub fn resolve_abstract_type(&self, model_reference: &Reference) -> Option<&Type> {
        self.modules
            .get(&model_reference.module_name)
            .and_then(|module| {
                module
                    .abstract_types_by_name
                    .get(&model_reference.type_name)
            })
    }

    fn add_type_and_replace_dependencies(
        module: &mut Module,
        module_resolver: &ModuleResolver,
        mut t: Type,
    ) -> Result<(), ModuleError> {
        let from = Reference {
            qualified_name: module_resolver.qualify(&t.named.type_name),
            module_name: module.module_name.to_owned(),
            type_name: t.named.type_name.to_owned(),
        };

        // remove any existing dependencies from this module.
        if module.types_by_name.contains_key(&t.named.type_name) {
            module.dependencies = module
                .dependencies
                .iter()
                .filter(|d| d.from == from)
                .cloned()
                .collect();
        }

        if t.is_abstract() {
            module
                .abstract_types_by_name
                .insert(t.named.type_name.to_owned(), t);
            return Ok(());
        }

        let mut new_type_deps: Vec<Dependency> = vec![];
        for inner_struct in t.inner_structs().iter() {
            if let Some(dependency) = inner_struct.as_dependency_from(&from) {
                new_type_deps.push(dependency.to_owned());
                module.dependencies.push(dependency);
            }
        }

        t.dependencies = new_type_deps;

        module.types_by_name.insert(t.named.type_name.to_owned(), t);

        Ok(())
    }

    fn add_types_to_module(module: &mut Module, module_dec: &ModuleDec) -> Result<(), ModuleError> {
        let module_resolver = ModuleResolver(module.module_name.to_owned());
        let mut type_names: Vec<&String> = module_dec.0.keys().collect();
        type_names.sort();

        for next in type_names {
            let t = module_resolver.type_from_dec(next, &module_dec.0[next])?;
            SchemaRegistry::add_type_and_replace_dependencies(module, &module_resolver, t)?;
        }

        Ok(())
    }

    pub fn new() -> SchemaRegistry {
        return SchemaRegistry {
            modules: HashMap::new(),
            missing_type_lookups: HashMap::new(),
            missing_module_lookups: HashSet::new(),
            unresolved_abstractions: HashMap::new(),
            module_dep_mapper: DepMapper::new(),
            type_dep_mapper: DepMapper::new(),
        };
    }
}

struct ModuleResolver(String);

impl ModuleResolver {
    fn qualify(&self, name: &str) -> String {
        if name.find(".").is_some() {
            return name.to_owned();
        }

        if name.chars().next().unwrap_or(' ').is_ascii_uppercase() {
            return format!("{}.{}", self.0, name);
        }

        return name.to_owned();
    }

    fn type_from_dec(&self, type_name: &str, type_dec: &TypeDec) -> Result<Type, ModuleError> {
        lazy_static! {
            static ref TYPE_NAME_REGEX: Regex =
                Regex::new(r"^[A-Z]+[a-zA-Z_]*[0123456789]*$").unwrap();
        }

        if !TYPE_NAME_REGEX.is_match(type_name) {
            return Err(ModuleError::BadTypeNameError(type_name.to_owned()));
        }

        let type_resolver = TypeResolver {
            module_resolver: &self,
            type_vars: type_dec.type_vars.to_owned(),
        };

        let named = Reference::from(self.qualify(type_name).as_ref());

        Ok(Type {
            named,
            ..type_resolver
                .type_of_dec(type_dec)
                .map_err(|fe| ModuleError::TypeDecError(type_name.to_owned(), fe))?
        })
    }
}

struct TypeResolver<'a> {
    module_resolver: &'a ModuleResolver,
    type_vars: Vec<String>,
}

impl<'a> TypeResolver<'a> {
    fn qualify(&self, name: &str) -> String {
        if name.chars().next().unwrap_or(' ').is_ascii_uppercase() {
            for type_var in self.type_vars.iter() {
                if type_var == name {
                    return name.to_owned();
                }
            }
        }

        return self.module_resolver.qualify(name);
    }

    fn type_of_dec(&self, type_dec: &TypeDec) -> Result<Type, TypeDecError> {
        lazy_static! {
            static ref FIELD_NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z_]+[0123456789]*$").unwrap();
        }

        let mut result = Type::default();
        result.tags = type_dec.tags.to_owned();
        result.type_vars = type_dec.type_vars.to_owned();

        if type_dec.is_a.len() > 0 {
            result.is_a = Some(
                self.type_struct_of_dec(&type_dec.is_a)
                    .map_err(|e| TypeDecError::IsAError(e))?,
            );
            return Ok(result);
        }

        if type_dec.r#enum.len() > 0 {
            result.options = type_dec.r#enum.to_owned();
            return Ok(result);
        }

        for field in type_dec.fields.iter() {
            let field_name = field.0.to_owned();

            if !FIELD_NAME_REGEX.is_match(&field_name) {
                return Err(TypeDecError::BadFieldNameError(field_name.to_owned()));
            }

            let field_dec = field.1;
            let tags = Vec::from(&field_dec.0[1..]);
            if field_dec.0.len() < 1 {
                return Err(TypeDecError::FieldError(
                    field_name.to_owned(),
                    FieldDecError::UnspecifiedType,
                ));
            }

            let type_struct = self
                .type_struct_of_dec(&field_dec.0[0])
                .map_err(|e| TypeDecError::FieldError(field_name.to_owned(), e))?;

            if type_struct.literal.is_some() {
                return Err(TypeDecError::FieldError(
                    field_name.to_owned(),
                    FieldDecError::LiteralInStructError,
                ));
            }

            result.fields.insert(
                field_name.to_owned(),
                Field {
                    field_name,
                    tags,
                    type_struct,
                },
            );
        }

        return Ok(result);
    }

    fn type_struct_of_dec(&self, field_val: &str) -> Result<TypeStruct, FieldDecError> {
        let (mut type_struct, unused) = self.parse_type_annotation(field_val)?;

        if let Some(field_val) = unused {
            if is_model_ref(field_val) {
                type_struct.reference = Reference::from(self.qualify(field_val).as_ref());
            } else {
                type_struct.primitive_type = parse_primitive_type(field_val)?;
            }
        }

        return Ok(type_struct);
    }

    fn parse_type_annotation<'b>(
        &self,
        field_val: &'b str,
    ) -> Result<(TypeStruct, Option<&'b str>), FieldDecError> {
        lazy_static! {
            static ref TYPE_ANNOTATION_REGEX: Regex =
                Regex::new(r"^literal:(.*):(.*)$|(.+)\{\}$|(.+)\[\]$|^([^<>]+)<([^<>]*)>$")
                    .unwrap();
        }

        TYPE_ANNOTATION_REGEX
            .captures(field_val)
            .and_then(|c| {
                c.get(1)
                    .map(|t| {
                        parse_literal_annotation(t.as_str(), c.get(2).unwrap().as_str())
                            .map(|s| (s, None))
                    })
                    .or_else(|| {
                        c.get(3).map(|t| {
                            Ok((
                                TypeStruct {
                                    struct_kind: StructKind::Map,
                                    ..TypeStruct::default()
                                },
                                Some(t.as_str()),
                            ))
                        })
                    })
                    .or_else(|| {
                        c.get(4).map(|t| {
                            Ok((
                                TypeStruct {
                                    struct_kind: StructKind::Repeated,
                                    ..TypeStruct::default()
                                },
                                Some(t.as_str()),
                            ))
                        })
                    })
                    .or_else(|| {
                        c.get(5).map(|t| {
                            let p_strs = c.get(6).unwrap().as_str();
                            let p_strs = p_strs.split(",");
                            let mut parameters: Vec<Reference> = vec![];

                            for p_str in p_strs {
                                let type_struct = self.type_struct_of_dec(p_str.trim())?;
                                if type_struct.literal.is_some() {
                                    return Err(FieldDecError::InvalidParameter(format!(
                                        "{} was a literal, but reference is required",
                                        p_str
                                    )));
                                }
                                if type_struct.reference.type_name.len() == 0 {
                                    return Err(FieldDecError::InvalidParameter(format!(
                                        "{} was a primitive, but reference is required",
                                        p_str
                                    )));
                                }
                                if type_struct.struct_kind != StructKind::Scalar {
                                    return Err(FieldDecError::InvalidParameter(format!(
                                        "{} was a {:?}, but a {:?} is required",
                                        p_str,
                                        type_struct.struct_kind,
                                        StructKind::Scalar
                                    )));
                                }
                                parameters.push(type_struct.reference);
                            }

                            Ok((
                                TypeStruct {
                                    parameters: parameters,
                                    ..TypeStruct::default()
                                },
                                Some(t.as_str()),
                            ))
                        })
                    })
            })
            .or_else(|| Some(Ok((TypeStruct::default(), Some(field_val)))))
            .unwrap()
    }
}

fn is_model_ref<'a>(type_val: &'a str) -> bool {
    return type_val.find(".").is_some()
        || type_val.chars().next().unwrap_or(' ').is_ascii_uppercase();
}

fn parse_literal_annotation<'a>(
    lit_type: &'a str,
    val: &'a str,
) -> Result<TypeStruct, FieldDecError> {
    let mut result = TypeStruct::default();
    result.struct_kind = StructKind::Scalar;
    result.primitive_type = parse_primitive_type(lit_type)?;

    let mut literal = Literal::default();

    match result.primitive_type {
        PrimitiveType::int53 => literal.int53 = serde_json::from_str(val)?,
        PrimitiveType::int64 => literal.int64 = serde_json::from_str(val)?,
        PrimitiveType::string => literal.string = val.to_owned(),
        PrimitiveType::double => literal.double = serde_json::from_str(val)?,
        PrimitiveType::bool => literal.bool = serde_json::from_str(val)?,
        PrimitiveType::any => return Err(FieldDecError::LiteralAnyError),
    }

    result.literal = Some(literal);
    return Ok(result);
}

fn parse_primitive_type(prim_kind: &str) -> Result<PrimitiveType, FieldDecError> {
    serde_json::from_value(serde_json::Value::String(prim_kind.to_owned()))
        .map_err(|e| FieldDecError::UnknownPrimitiveType(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::declarations::*;
    use crate::schema::*;
    use regex::Regex;
    use std::collections::HashMap;
    use std::collections::HashSet;
    use std::error::Error;
    use std::fmt::Display;
    use std::iter::FromIterator;

    macro_rules! map(
        { $($key:expr => $value:expr),+ } => {
            {
                let mut m = ::std::collections::HashMap::new();
                $(
                    m.insert($key, $value);
                )+
                m
            }
        };
    );

    #[test]
    fn test_missing_imports() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "b.B".to_string(),
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);

        let type_dec = TypeDec {
            is_a: "c.C".to_string(),
            type_vars: vec!["T".to_string()],
            ..TypeDec::default()
        };
        module_dec.0.insert("AA".to_owned(), type_dec);

        let result = registry.process_module("a".to_owned(), &module_dec);
        assert_eq!(result, Ok(()));
        assert_eq!(
            registry.missing_module_lookups,
            HashSet::from_iter(vec!["b".to_owned()])
        );
        assert_eq!(
            registry
                .missing_type_lookups
                .keys()
                .map(|r| r.qualified_name.to_owned())
                .collect::<Vec<String>>(),
            vec!["b.B".to_owned()]
        );
    }

    #[test]
    fn test_duplicate_import_error() {
        let mut registry = SchemaRegistry::new();
        let module_dec = ModuleDec::default();
        let result = registry.process_module("My_module".to_owned(), &module_dec);
        assert!(result.is_ok());

        let result = registry.process_module("My_module".to_owned(), &module_dec);
        assert_eq!(
            result,
            Err(ProcessingError::DuplicateImportError(
                "My_module".to_string(),
            ))
        );
    }

    #[test]
    fn test_primitive_generic_parameter() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "T[]".to_string(),
            type_vars: vec!["T".to_string()],
            ..TypeDec::default()
        };
        module_dec.0.insert("AList".to_owned(), type_dec);

        let type_dec = TypeDec {
            is_a: "AList<string>".to_string(),
            ..TypeDec::default()
        };
        module_dec.0.insert("StringList".to_owned(), type_dec);

        let result = registry.process_module("a".to_owned(), &module_dec);
        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "a".to_string(),
                ModuleError::TypeDecError(
                    "StringList".to_string(),
                    TypeDecError::IsAError(FieldDecError::InvalidParameter(
                        "string was a primitive, but reference is required".to_string()
                    ))
                )
            ))
        );
    }

    #[test]
    fn test_generics_in_struct() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "T[]".to_string(),
            type_vars: vec!["T".to_string()],
            ..TypeDec::default()
        };
        module_dec.0.insert("AList".to_owned(), type_dec);

        let type_dec = TypeDec {
            fields: map! { "my_field".to_owned() => FieldDec(vec!["AList<AString>".to_owned()]) },
            ..TypeDec::default()
        };
        module_dec.0.insert("FancyStruct".to_owned(), type_dec);

        let type_dec = TypeDec {
            is_a: "string".to_string(),
            ..TypeDec::default()
        };
        module_dec.0.insert("AString".to_owned(), type_dec);

        let result = registry.process_module("a".to_owned(), &module_dec);
        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "a".to_string(),
                ModuleError::GenericTypeError(
                    "FancyStruct".to_string(),
                    "generics only supported in `is_a` type aliases".to_string(),
                )
            ))
        );
    }

    #[test]
    fn test_circular_abstract_types() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "T[]".to_string(),
            type_vars: vec!["T".to_string()],
            ..TypeDec::default()
        };
        module_dec.0.insert("AList".to_owned(), type_dec);

        let type_dec = TypeDec {
            is_a: "b.BList<AString>".to_string(),
            ..TypeDec::default()
        };
        module_dec.0.insert("StringList".to_owned(), type_dec);

        let type_dec = TypeDec {
            is_a: "string".to_string(),
            ..TypeDec::default()
        };
        module_dec.0.insert("AString".to_owned(), type_dec);

        let result = registry.process_module("a".to_owned(), &module_dec);
        assert_eq!(result, Ok(()));

        let type_dec = TypeDec {
            is_a: "T[]".to_string(),
            type_vars: vec!["T".to_string()],
            ..TypeDec::default()
        };
        module_dec.0.insert("BList".to_owned(), type_dec);

        let type_dec = TypeDec {
            is_a: "a.AList<a.AString>".to_string(),
            ..TypeDec::default()
        };
        module_dec.0.insert("StringList".to_owned(), type_dec);

        let result = registry.process_module("My_module2".to_owned(), &module_dec);
        assert_eq!(result, Ok(()));
    }

    #[test]
    fn test_field_names() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            fields: map! { "ok_field".to_owned() => FieldDec(vec!["string".to_owned()]) },
            ..TypeDec::default()
        };
        module_dec.0.insert("My_model".to_owned(), type_dec);

        let result = registry.process_module("My_module".to_owned(), &module_dec);
        assert!(result.is_ok());

        let type_dec = TypeDec {
            fields: map! { "not.ok.field".to_owned() => FieldDec(vec!["string".to_owned()]) },
            ..TypeDec::default()
        };
        module_dec.0.insert("My_model2".to_owned(), type_dec);

        let result = registry.process_module("My_module2".to_owned(), &module_dec);

        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "My_module2".to_string(),
                ModuleError::TypeDecError(
                    "My_model2".to_string(),
                    TypeDecError::BadFieldNameError("not.ok.field".to_string())
                ),
            ))
        );
    }

    #[test]
    fn test_type_names() {
        let mut registry = SchemaRegistry::new();
        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "string".to_owned(),
            ..TypeDec::default()
        };
        module_dec.0.insert("My_model".to_owned(), type_dec);

        let result = registry.process_module("my_module".to_owned(), &module_dec);
        assert!(result.is_ok());

        let type_dec = TypeDec {
            is_a: "string".to_owned(),
            ..TypeDec::default()
        };
        module_dec
            .0
            .insert("my_model".to_owned(), TypeDec { ..type_dec });

        let result = registry.process_module("my_module2".to_owned(), &module_dec);

        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "my_module2".to_string(),
                ModuleError::BadTypeNameError("my_model".to_string())
            ))
        )
    }

    #[test]
    fn test_literal_struct_restrictions() {
        let mut registry = SchemaRegistry::new();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            fields: map! { "a".to_string() => FieldDec(vec!["literal:string:1[]".to_owned()]) },
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);
        let result = registry.process_module("a".to_owned(), &module_dec);

        assert_eq!(
            result,
            Err(ProcessingError::ModuleError(
                "a".to_string(),
                ModuleError::TypeDecError(
                    "A".to_string(),
                    TypeDecError::FieldError("a".to_owned(), FieldDecError::LiteralInStructError)
                )
            ))
        )
    }

    #[test]
    fn test_circular_import() {
        let mut registry = SchemaRegistry::new();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "a.A".to_owned(),
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);
        registry
            .process_module("b".to_owned(), &module_dec)
            .unwrap();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "c.A".to_owned(),
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);
        registry
            .process_module("a".to_owned(), &module_dec)
            .unwrap();

        let mut module_dec = ModuleDec::default();
        let type_dec = TypeDec {
            is_a: "b.A".to_owned(),
            ..TypeDec::default()
        };
        module_dec.0.insert("A".to_owned(), type_dec);
        let result = registry.process_module("c".to_owned(), &module_dec);

        assert!(result.is_err());

        match result {
            Err(ProcessingError::CircularImportError(desc)) => assert_eq!(desc, "b <- c <- a <- b"),
            _ => assert!(false),
        }
    }
}
