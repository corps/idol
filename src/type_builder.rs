use crate::err::{FieldDecError, ModuleError, TypeDecError};
use crate::models::declarations::*;
use crate::schema::*;
use crate::type_builder::Kind::Unspecialized;
use crate::type_builder::UnspecializedKind::Primitive;
use regex::Regex;
use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use std::ops::Deref;

pub struct TypeBuilder<'a> {
    resolver: ModuleResolver,
    type_dec: TypeDec,
    types_map: &'a HashMap<Reference, Type>,
}

enum ComposeResult {
    TakeLeft,
    TakeRight,
    TakeEither,
    WidenTo(UnspecializedKind),
    ComposeFields(HashMap<String, Box<ComposeResult>>),
}

#[derive(Clone)]
enum UnspecializedKind {
    Literal(Literal, PrimitiveType),
    Primitive(PrimitiveType),
    Fields(HashMap<String, Box<Kind>>),
    Enum(Vec<String>),
    Repeated(Box<Kind>),
    Map(Box<Kind>),
}

#[derive(Clone)]
enum Kind {
    Specialized(UnspecializedKind),
    Unspecialized(UnspecializedKind),
}

impl Kind {
    fn from_type_struct(
        is_a: &TypeStruct,
        types: &HashMap<Reference, Type>,
    ) -> Result<Kind, Reference> {
        let scalar_kind: Kind = if !is_a.is_reference() {
            if is_a.literal.is_some() {
                Kind::Unspecialized(UnspecializedKind::Literal(
                    is_a.literal.to_owned().unwrap(),
                    is_a.primitive_type.to_owned(),
                ))
            } else {
                Kind::Unspecialized(UnspecializedKind::Primitive(is_a.primitive_type.to_owned()))
            }
        } else {
            types
                .get(&is_a.reference)
                .map(|t| Kind::from_type(t, types))
                .unwrap_or(Err(is_a.reference.to_owned()))?
        };

        return Ok(match is_a.struct_kind {
            StructKind::Map => Kind::Unspecialized((UnspecializedKind::Map(Box::new(scalar_kind)))),
            StructKind::Repeated => {
                Kind::Unspecialized((UnspecializedKind::Repeated(Box::new(scalar_kind))))
            }
            StructKind::Scalar => scalar_kind,
        });
    }

    fn from_type(t: &Type, types: &HashMap<Reference, Type>) -> Result<Kind, Reference> {
        let base_kind: Kind = if t.is_struct() {
            let mut map: HashMap<String, Box<Kind>> = HashMap::new();
            for (k, v) in t.fields.iter() {
                map.insert(k.to_owned(), Box::new(Kind::from_field(v, types)?));
            }
            Kind::Unspecialized(UnspecializedKind::Fields(map))
        } else if t.is_enum() {
            Kind::Unspecialized(UnspecializedKind::Enum(t.options.to_owned()))
        } else {
            Kind::from_type_struct(&t.is_a.to_owned().unwrap(), types)?
        };

        if let Kind::Unspecialized(unspecialized) = &base_kind {
            if t.tags
                .iter()
                .position(|i| !i.starts_with("description:"))
                .is_some()
            {
                return Ok(Kind::Specialized(unspecialized.to_owned()));
            }
        }

        return Ok(base_kind);
    }

    fn from_field(field: &Field, types: &HashMap<Reference, Type>) -> Result<Kind, Reference> {
        let base_kind = Kind::from_type_struct(&field.type_struct, types)?;

        if let Kind::Unspecialized(unspecialized) = &base_kind {
            if field
                .tags
                .iter()
                .position(|i| !i.starts_with("description:"))
                .is_some()
            {
                return Ok(Kind::Specialized(unspecialized.to_owned()));
            }
        }

        return Ok(base_kind);
    }

    fn is_specialized(&self) -> bool {
        match self {
            Kind::Unspecialized(_) => false,
            _ => true,
        }
    }
}

impl Variance {
    fn flip(&self) -> Variance {
        match self {
            Variance::Covariant => Variance::Contravariant,
            Variance::Contravariant => Variance::Covariant,
            Variance::Invariant => Variance::Invariant,
        }
    }
}

impl Kind {
    fn compose(&self, other: &Self, variance: Variance) -> Result<ComposeResult, String> {
        return match (self, other) {
            (Kind::Specialized(inner), Kind::Specialized(other_inner)) => {
                match variance {
                    Variance::Invariant => {
                        Err("two specialized types cannot be invariant".to_string())
                    }
                    Variance::Covariant => Err(
                        "cannot select a narrower covariant amongst two specialized types"
                            .to_string(),
                    ),
                    Variance::Contravariant => {
                        match inner.compose(&other_inner, variance)? {
                            // eg: str' str' => str
                            ComposeResult::TakeEither => {
                                Ok(ComposeResult::WidenTo(inner.to_owned()))
                            }
                            // eg: str' lit:str' => any
                            _ => Ok(ComposeResult::WidenTo(UnspecializedKind::Primitive(
                                PrimitiveType::any,
                            ))),
                        }
                    }
                }
            }
            // int' str
            (Kind::Specialized(inner), Kind::Unspecialized(other_inner)) => {
                match variance {
                    Variance::Invariant => Err("specialized types cannot be invariant".to_string()),
                    Variance::Covariant => {
                        // int' lit:int =>
                        // str' int => None
                        match inner.compose(&other_inner, variance)? {
                            // int' int => int'
                            // int' any => int'
                            // int' lit:int => None
                            ComposeResult::TakeEither => Ok(ComposeResult::TakeLeft),
                            ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                            ComposeResult::ComposeFields(x) => Ok(ComposeResult::ComposeFields(x)),
                            _ => Err("Specialized type cannot be safely narrowed because it wasn't already narrow enough.".to_string())
                        }
                    }
                    Variance::Contravariant => match inner.compose(&other_inner, variance)? {
                        ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                        ComposeResult::ComposeFields(x) => Ok(ComposeResult::ComposeFields(x)),
                        _ => Ok(ComposeResult::WidenTo(UnspecializedKind::Primitive(
                            PrimitiveType::any,
                        ))),
                    },
                }
            }
            (Kind::Unspecialized(inner), Kind::Specialized(other_inner)) => {
                // Unfortunately we can't simply reverse the order of the operands and flip the results
                // in this case, because we'd also have to do so for the recursively inner field
                // results in the case of ComposeFields.  There's probably a clever way to simplify and
                // DRY up.
                match variance {
                    Variance::Invariant => Err("specialized types cannot be invariant".to_string()),
                    Variance::Covariant => {
                        match inner.compose(&other_inner, variance)? {
                            ComposeResult::TakeEither => Ok(ComposeResult::TakeRight),
                            ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                            ComposeResult::ComposeFields(x) => Ok(ComposeResult::ComposeFields(x)),
                            _ => Err("Specialized type cannot be safely narrowed because it wasn't already narrow enough.".to_string())
                        }
                    }
                    Variance::Contravariant => {
                        match inner.compose(&other_inner, variance)? {
                            ComposeResult::TakeLeft => {
                                Ok(ComposeResult::TakeLeft)
                            },
                            ComposeResult::ComposeFields(x) => Ok(ComposeResult::ComposeFields(x)),
                            _ => {
                                Ok(ComposeResult::WidenTo(UnspecializedKind::Primitive(
                                    PrimitiveType::any,
                                )))
                            }
                        }
                    }
                }
            }
            (Kind::Unspecialized(inner), Kind::Unspecialized(other_inner)) => {
                inner.compose(&other_inner, variance)
            }
        };
    }
}

impl UnspecializedKind {
    fn compose(&self, other: &Self, variance: Variance) -> Result<ComposeResult, String> {
        match (self, other, variance.to_owned()) {
            (UnspecializedKind::Literal(v, p), UnspecializedKind::Literal(v2, p2), _) => {
                if p == p2 && v == v2 {
                    return Ok(ComposeResult::TakeEither);
                }

                Err("Two literals with differing values cannot compose".to_string())
            }
            (
                UnspecializedKind::Literal(_, p),
                UnspecializedKind::Primitive(p2),
                Variance::Covariant,
            ) => {
                match UnspecializedKind::Primitive(p.to_owned()).compose(&other, variance.to_owned())? {
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeLeft),
                    _ =>
                        Err(format!(
                            "No narrower covariant type can be given between Literal primitive type {:?} and {:?}",
                            p, p2
                        ))
                }
            }
            (
                UnspecializedKind::Literal(_, p),
                UnspecializedKind::Primitive(p2),
                Variance::Contravariant,
            ) => {
                if p == p2 {
                    return Ok(ComposeResult::TakeRight);
                }

                Ok(ComposeResult::WidenTo(UnspecializedKind::Primitive(
                    PrimitiveType::any,
                )))
            }
            (UnspecializedKind::Primitive(p2), UnspecializedKind::Literal(_, p), _) => {
                match other.compose(&self, variance.to_owned())? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeLeft),
                    c => Ok(c),
                }
            }
            (
                UnspecializedKind::Primitive(p),
                UnspecializedKind::Primitive(p2),
                Variance::Covariant,
            ) => match (p, p2) {
                (PrimitiveType::any, PrimitiveType::any) => Ok(ComposeResult::TakeEither),
                (PrimitiveType::any, _) => Ok(ComposeResult::TakeRight),
                (_, PrimitiveType::any) => Ok(ComposeResult::TakeLeft),
                _ => {
                    if p == p2 {
                        return Ok(ComposeResult::TakeEither);
                    }

                    Err(format!(
                        "No narrower covariant type can be given between primitive types {:?} and {:?}",
                        p, p2
                    ))
                }
            },
            (
                UnspecializedKind::Primitive(p),
                UnspecializedKind::Primitive(p2),
                Variance::Contravariant,
            ) => match (p, p2) {
                (PrimitiveType::any, PrimitiveType::any) => Ok(ComposeResult::TakeEither),
                (PrimitiveType::any, _) => Ok(ComposeResult::TakeLeft),
                (_, PrimitiveType::any) => Ok(ComposeResult::TakeRight),
                _ => {
                    if p == p2 {
                        return Ok(ComposeResult::TakeEither);
                    }

                    Ok(ComposeResult::WidenTo(UnspecializedKind::Primitive(
                        PrimitiveType::any,
                    )))
                }
            },
            (
                UnspecializedKind::Primitive(p),
                UnspecializedKind::Primitive(p2),
                Variance::Invariant,
            ) => {
                if p == p2 {
                    return Ok(ComposeResult::TakeEither);
                }

                Err(format!(
                    "Differing primitives are not invariant: {:?} {:?}",
                    p, p2
                ))
            }
            (UnspecializedKind::Primitive(PrimitiveType::any), _, Variance::Contravariant) => {
                Ok(ComposeResult::TakeLeft)
            }
            (_, UnspecializedKind::Primitive(PrimitiveType::any), Variance::Contravariant) => {
                Ok(ComposeResult::TakeRight)
            }
            (UnspecializedKind::Primitive(PrimitiveType::any), _, Variance::Covariant) => {
                Ok(ComposeResult::TakeRight)
            }
            (_, UnspecializedKind::Primitive(PrimitiveType::any), Variance::Covariant) => {
                Ok(ComposeResult::TakeLeft)
            }
            (
                UnspecializedKind::Enum(options),
                UnspecializedKind::Enum(other_options),
                Variance::Covariant,
            ) => {
                if (options.len() > other_options.len()) {
                    match other.compose(self, variance.to_owned())? {
                        ComposeResult::TakeLeft => Ok(ComposeResult::TakeRight),
                        ComposeResult::TakeRight => {
                            unreachable!("enum compose branch should not include TakeRight!")
                        }
                        result => Ok(result),
                    }
                } else {
                    let missing_options: Vec<&String> = options
                        .iter()
                        .filter(|i| other_options.contains(i))
                        .collect();
                    if missing_options.len() == 0 {
                        if options.len() < other_options.len() {
                            return Ok(ComposeResult::TakeLeft);
                        }

                        options.get(0).and_then(|head| {
                            other_options.get(0).map(|other_head| if head == other_head {
                                Ok(ComposeResult::TakeEither)
                            } else {
                                // When the default enum value does not match, the length is required
                                // to canonically determine whose 
                                // ill defined.
                                Err(format!("Cannot compose two enums that are equal but with different first entry!"))
                            })
                        }).unwrap_or_else(|| Err(format!("Empty enum cannot be composed!")))
                    } else {
                        Err(format!("Cannot find narrower covariant enum, some entries in the the smaller enum not in the large: {:?}", missing_options))
                    }
                }
            }
            (
                UnspecializedKind::Enum(options),
                UnspecializedKind::Enum(other_options),
                Variance::Contravariant,
            ) => {
                if options.len() < other_options.len() {
                    match other.compose(self, variance.to_owned())? {
                        ComposeResult::TakeLeft => Ok(ComposeResult::TakeRight),
                        ComposeResult::TakeRight => {
                            unreachable!("enum compose branch should not include TakeRight!")
                        }
                        result => Ok(result),
                    }
                } else {
                    if other_options.iter().all(|i| options.contains(i)) {
                        options
                            .get(0)
                            .and_then(|head| {
                                other_options.get(0).and_then(|other_head| {
                                    if head == other_head {
                                        if options.len() == other_options.len() {
                                            Some(Ok(ComposeResult::TakeEither))
                                        } else {
                                            Some(Ok(ComposeResult::TakeLeft))
                                        }
                                    } else {
                                        None
                                    }
                                })
                            })
                            .unwrap_or(Ok(ComposeResult::WidenTo(UnspecializedKind::Primitive(
                                PrimitiveType::any,
                            ))))
                    } else {
                        if !other_options.iter().any(|i| options.contains(i)) {
                            let mut all_options: Vec<String> = other_options
                                .iter()
                                .chain(options.iter())
                                .cloned()
                                .collect();
                            all_options.sort();
                            Ok(ComposeResult::WidenTo(UnspecializedKind::Enum(all_options)))
                        } else {
                            Ok(ComposeResult::WidenTo(UnspecializedKind::Primitive(
                                PrimitiveType::any,
                            )))
                        }
                    }
                }
            }
            (
                UnspecializedKind::Enum(options),
                UnspecializedKind::Enum(other_options),
                Variance::Invariant,
            ) => (if other_options.iter().all(|i| options.contains(i))
                && options.len() == other_options.len()
            {
                options.get(0).and_then(|head| {
                    other_options.get(0).and_then(|other_head| {
                        if head == other_head {
                            if options.len() == other_options.len() {
                                Some(Ok(ComposeResult::TakeEither))
                            } else {
                                None
                            }
                        } else {
                            None
                        }
                    })
                })
            } else {
                None
            })
            .unwrap_or(Err(format!(
                "Enum inhabitants were not equal, not invariant {:?} {:?}",
                options, other_options
            ))),
            (
                UnspecializedKind::Repeated(inner_kind_box),
                UnspecializedKind::Repeated(other_inner_kind_box),
                Variance::Covariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance.to_owned())? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Err(format!(
                        "Cannot compose container repeated if inner type would change"
                    )),
                }
            }
            (
                UnspecializedKind::Map(inner_kind_box),
                UnspecializedKind::Map(other_inner_kind_box),
                Variance::Covariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance.to_owned())? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Err(format!(
                        "Cannot compose container map if inner type would change"
                    )),
                }
            }
            (
                UnspecializedKind::Repeated(inner_kind_box),
                UnspecializedKind::Repeated(other_inner_kind_box),
                Variance::Contravariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance.to_owned())? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Ok(ComposeResult::WidenTo(UnspecializedKind::Repeated(
                        Box::new(Kind::Unspecialized(UnspecializedKind::Primitive(
                            PrimitiveType::any,
                        ))),
                    ))),
                }
            }
            (
                UnspecializedKind::Map(inner_kind_box),
                UnspecializedKind::Map(other_inner_kind_box),
                Variance::Contravariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance.to_owned())? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Ok(ComposeResult::WidenTo(UnspecializedKind::Map(Box::new(
                        Kind::Unspecialized(UnspecializedKind::Primitive(PrimitiveType::any)),
                    )))),
                }
            }
            (
                UnspecializedKind::Repeated(inner_kind_box),
                UnspecializedKind::Repeated(other_inner_kind_box),
                Variance::Invariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                inner_kind.compose(&other_inner_kind, variance.to_owned())
            }
            (
                UnspecializedKind::Map(inner_kind_box),
                UnspecializedKind::Map(other_inner_kind_box),
                Variance::Invariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                inner_kind.compose(&other_inner_kind, variance.to_owned())
            }
            (
                UnspecializedKind::Fields(fields),
                UnspecializedKind::Fields(other_fields),
                Variance::Covariant,
            ) => {
                // covariance in fields will add new fields and select the narrowest of one
                // side.  however, it will fail if the variance between fields is inconsistently
                // the left or right operand
                let mut field_changes: HashMap<String, Box<ComposeResult>> = HashMap::new();
                let mut first_left_preference: Option<String> = None;
                let mut first_right_preference: Option<String> = None;

                for (k, v) in fields.iter() {
                    let v = v.deref();
                    let other_v = other_fields[k].deref();
                    let composed = v.compose(other_v, variance.to_owned())?;

                    match composed {
                        ComposeResult::TakeLeft => {
                            if let Some(first_right_preference) = first_right_preference.clone() {
                                Err(format!("Could not narrow structure, field {} on right hand side is narrower than left, but field {} on left hand side is narrower than right", first_right_preference, k))?;
                            } else {
                                first_left_preference =
                                    first_left_preference.or_else(|| Some(k.to_owned()));
                                field_changes
                                    .insert(k.to_owned(), Box::new(ComposeResult::TakeLeft));
                            }
                        }
                        ComposeResult::TakeRight => {
                            if let Some(first_left_preference) = first_left_preference.clone() {
                                Err(format!("Could not narrow structure, field {} on left hand side is narrower than right, but field {} on right hand side is narrower than left", first_left_preference, k))?;
                            } else {
                                first_right_preference =
                                    first_right_preference.or_else(|| Some(k.to_owned()));
                                field_changes
                                    .insert(k.to_owned(), Box::new(ComposeResult::TakeRight));
                            }
                        }
                        _ => {
                            field_changes.insert(k.to_owned(), Box::new(composed));
                        }
                    }
                }

                for (k, v) in other_fields.iter() {
                    if fields.contains_key(k) {
                        continue;
                    }

                    let v = v.deref();
                    let other_v = fields[k].deref();
                    let composed = other_v.compose(v, variance.to_owned())?;

                    match composed {
                        ComposeResult::TakeLeft => {
                            if let Some(first_right_preference) = first_right_preference {
                                return Err(format!("Could not narrow structure, field {} on right hand side is narrower than left, but field {} on left hand side is narrower than right", first_right_preference, k));
                            } else {
                                first_left_preference =
                                    first_left_preference.or_else(|| Some(k.to_owned()));
                                field_changes
                                    .insert(k.to_owned(), Box::new(ComposeResult::TakeLeft));
                            }
                        }
                        ComposeResult::TakeRight => {
                            if let Some(first_left_preference) = first_left_preference {
                                return Err(format!("Could not narrow structure, field {} on left hand side is narrower than right, but field {} on right hand side is narrower than left", first_left_preference, k));
                            } else {
                                first_right_preference =
                                    first_right_preference.or_else(|| Some(k.to_owned()));
                                field_changes
                                    .insert(k.to_owned(), Box::new(ComposeResult::TakeRight));
                            }
                        }
                        _ => {
                            field_changes.insert(k.to_owned(), Box::new(composed));
                        }
                    }
                }

                if fields.len() == other_fields.len()
                    && fields.keys().all(|k| other_fields.contains_key(k))
                {
                    if first_left_preference.is_some() {
                        Ok(ComposeResult::TakeLeft)
                    } else if first_right_preference.is_some() {
                        Ok(ComposeResult::TakeRight)
                    } else {
                        Ok(ComposeResult::TakeEither)
                    }
                } else {
                    Ok(ComposeResult::ComposeFields(field_changes))
                }
            }
            (_, _, Variance::Covariant) => Err(format!(
                "Could not select narrow covariant amongst these types"
            )),
            (_, _, Variance::Invariant) => Err(format!("Types were not invariant")),
            (_, _, Variance::Contravariant) => Ok(ComposeResult::WidenTo(
                UnspecializedKind::Primitive(PrimitiveType::any),
            )),
        }
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
}

impl<'a> TypeBuilder<'a> {
    pub fn new(
        module_name: &str,
        type_dec: TypeDec,
        types_map: &'a HashMap<Reference, Type>,
    ) -> TypeBuilder<'a> {
        TypeBuilder {
            type_dec,
            resolver: ModuleResolver(module_name.to_string()),
            types_map,
        }
    }

    pub fn validate_type_name(type_name: &str) -> Result<(), ModuleError> {
        lazy_static! {
            static ref TYPE_NAME_REGEX: Regex =
                Regex::new(r"^[A-Z]+[a-zA-Z_]*[0123456789]*$").unwrap();
        }

        if !TYPE_NAME_REGEX.is_match(type_name) {
            return Err(ModuleError::BadTypeNameError(type_name.to_string()));
        }

        Ok(())
    }

    pub fn process(&mut self, type_name: &str) -> Result<Result<Type, Reference>, ModuleError> {
        let mut t = Type::default();

        TypeBuilder::validate_type_name(type_name)?;
        t.named = Reference::from(self.resolver.qualify(type_name).as_ref());
        t.tags = self.type_dec.tags.to_owned();

        let is_a_structs = self
            .handle_is_a()
            .map_err(|err| ModuleError::TypeDecError(type_name.to_string(), err))?;

        if self.type_dec.r#enum.len() > 0 {
            t.options = self.type_dec.r#enum.to_owned();

            for ts in is_a_structs.iter() {
                match self.get_resolved_composition_type(type_name, ts) {
                    Ok(t) => {}
                    r => {
                        return Ok(r);
                    }
                }
            }
        }

        Ok(Ok(t.to_owned()))
    }

    fn get_resolved_composition_type(
        &self,
        type_name: &str,
        ts: &TypeStruct,
    ) -> Result<Type, Reference> {
        if ts.is_reference() {
            return self
                .types_map
                .get(&ts.reference)
                .map(|t| Ok(t.to_owned()))
                .unwrap_or_else(|| Err(ts.reference.to_owned()));
        }

        Ok(Type {
            is_a: Some(ts.to_owned()),
            ..Type::default()
        })
    }

    fn handle_is_a(&mut self) -> Result<Vec<TypeStruct>, TypeDecError> {
        let mut result = vec![];
        for type_dec in self.type_dec.is_a.iter() {
            result.push(
                self.parse_type_struct(type_dec.as_str())
                    .map_err(|err| TypeDecError::IsAError(err))?
                    .to_owned(),
            );
        }

        return Ok(result);
    }

    pub fn parse_type_struct(&self, field_val: &str) -> Result<TypeStruct, FieldDecError> {
        let (mut type_struct, unused) = self.parse_type_annotation(field_val)?;

        if let Some(field_val) = unused {
            if TypeBuilder::is_model_ref(field_val) {
                type_struct.reference = Reference::from(self.resolver.qualify(field_val).as_ref());
            } else {
                type_struct.primitive_type = TypeBuilder::parse_primitive_type(field_val)?;
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
                Regex::new(r"^literal:(.*):(.*)$|(.+)\{\}$|(.+)\[\]$").unwrap();
        }

        TYPE_ANNOTATION_REGEX
            .captures(field_val)
            .and_then(|c| {
                c.get(1)
                    .map(|t| {
                        TypeBuilder::parse_literal_annotation(
                            t.as_str(),
                            c.get(2).unwrap().as_str(),
                        )
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
            })
            .or_else(|| Some(Ok((TypeStruct::default(), Some(field_val)))))
            .unwrap()
    }

    pub fn parse_literal_annotation<'x>(
        lit_type: &'x str,
        val: &'x str,
    ) -> Result<TypeStruct, FieldDecError> {
        let mut result = TypeStruct::default();
        result.struct_kind = StructKind::Scalar;
        result.primitive_type = TypeBuilder::parse_primitive_type(lit_type)?;

        let mut literal = Literal::default();

        match result.primitive_type {
            PrimitiveType::int => literal.int = serde_json::from_str(val)?,
            PrimitiveType::string => literal.string = val.to_owned(),
            PrimitiveType::double => literal.double = serde_json::from_str(val)?,
            PrimitiveType::bool => literal.bool = serde_json::from_str(val)?,
            PrimitiveType::any => return Err(FieldDecError::LiteralAnyError),
        }

        result.literal = Some(literal);
        return Ok(result);
    }

    pub fn parse_primitive_type(prim_kind: &str) -> Result<PrimitiveType, FieldDecError> {
        serde_json::from_value(serde_json::Value::String(prim_kind.to_owned()))
            .map_err(|e| FieldDecError::UnknownPrimitiveType(e.to_string()))
    }

    pub fn is_model_ref<'x>(type_val: &'x str) -> bool {
        return type_val.find(".").is_some()
            || type_val.chars().next().unwrap_or(' ').is_ascii_uppercase();
    }
}
