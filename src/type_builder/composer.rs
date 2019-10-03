use crate::err::{FieldDecError, TypeDecError};
use crate::models::declarations::Variance;
use crate::models::declarations::Variance::{Contravariant, Covariant, Invariant};
use crate::schema::{PrimitiveType, StructKind, TypeStruct};
use crate::type_builder::denormalized::ComposeResult::{
    ComposeFields, TakeEither, TakeLeft, TakeRight, WidenTo,
};
use crate::type_builder::denormalized::DenormalizedType::{Annotated, Anonymous};
use crate::type_builder::denormalized::{AnonymousType, ComposeResult, DenormalizedType};
use std::collections::HashMap;
use std::ops::Deref;

impl DenormalizedType {
    fn unwrap_compose_params(&self) -> (&AnonymousType, bool) {
        match self {
            (Annotated(inner, _, specialized)) => (inner, specialized.to_owned()),
            (Anonymous(inner)) => (inner, false),
        }
    }

    pub fn compose(&self, other: &Self, variance: &Variance) -> Result<ComposeResult, String> {
        let (anon, specialized) = self.unwrap_compose_params();
        let (other_anon, other_specialized) = other.unwrap_compose_params();

        return match (specialized, other_specialized) {
            (true, true) => {
                match variance {
                    Invariant => Err("two specialized types cannot be invariant.".to_string()),
                    Covariant => Err(
                        "cannot select a narrower covariant amongst two specialized types"
                            .to_string(),
                    ),
                    Contravariant => {
                        match anon.compose(&other_anon, variance)? {
                            // eg: str' str' => str
                            TakeEither => Ok(WidenTo(anon.to_owned())),
                            // eg: str' lit:str' => any
                            _ => Ok(WidenTo(AnonymousType::Primitive(PrimitiveType::any))),
                        }
                    }
                }
            }
            // int' str
            (true, false) => {
                match variance {
                    Invariant => Err("specialized types cannot be invariant".to_string()),
                    Covariant => {
                        // int' lit:int =>
                        // str' int => None
                        match anon.compose(&other_anon, variance)? {
                            // int' int => int'
                            // int' any => int'
                            // int' lit:int => None
                            TakeEither => Ok(TakeLeft(false)),
                            TakeLeft(b) => Ok(TakeLeft(b)),
                            ComposeFields(x) => Ok(ComposeFields(x)),
                            _ => Err("Specialized type cannot be safely narrowed because it wasn't already narrow enough.".to_string())
                        }
                    }
                    Contravariant => match anon.compose(&other_anon, variance)? {
                        TakeRight(b) => Ok(TakeRight(b)),
                        ComposeFields(x) => Ok(ComposeResult::ComposeFields(x)),
                        _ => Ok(WidenTo(AnonymousType::Primitive(PrimitiveType::any))),
                    },
                }
            }
            (false, true) => {
                // Unfortunately we can't simply reverse the order of the operands and flip the results
                // in this case, because we'd also have to do so for the recursively inner field
                // results in the case of ComposeFields.  There's probably a clever way to simplify and
                // DRY up.
                match variance {
                    Invariant => Err("specialized types cannot be invariant".to_string()),
                    Covariant => {
                        match anon.compose(&other_anon, variance)? {
                            TakeEither => Ok(TakeRight(false)),
                            TakeRight(b) => Ok(TakeRight(b)),
                            ComposeFields(x) => Ok(ComposeFields(x)),
                            _ => Err("Specialized type cannot be safely narrowed because it wasn't already narrow enough.".to_string())
                        }
                    }
                    Contravariant => {
                        match anon.compose(&other_anon, variance)? {
                            TakeLeft(b) => {
                                Ok(TakeLeft(b))
                            }
                            ComposeFields(x) => Ok(ComposeFields(x)),
                            _ => {
                                Ok(WidenTo(AnonymousType::Primitive(
                                    PrimitiveType::any,
                                )))
                            }
                        }
                    }
                }
            }
            (false, false) => anon.compose(&other_anon, variance),
        };
    }
}

impl AnonymousType {
    fn compose(&self, other: &Self, variance: &Variance) -> Result<ComposeResult, String> {
        match (self, other, variance.to_owned()) {
            (AnonymousType::Literal(v, p), AnonymousType::Literal(v2, p2), _) => {
                if p == p2 && v == v2 {
                    return Ok(TakeEither);
                }

                Err("Two literals with differing values cannot compose".to_string())
            }
            (
                AnonymousType::Literal(_, p),
                AnonymousType::Primitive(p2),
                Variance::Covariant,
            ) => {
                match AnonymousType::Primitive(p.to_owned()).compose(&other, variance)? {
                    TakeRight(b) => Ok(TakeLeft(b)),
                    TakeEither => Ok(TakeLeft(false)),
                    _ =>
                        Err(format!(
                            "No narrower covariant type can be given between Literal primitive type {:?} and {:?}",
                            p, p2
                        ))
                }
            }
            (
                AnonymousType::Literal(_, p),
                AnonymousType::Primitive(p2),
                Variance::Contravariant,
            ) => {
                if p == p2 {
                    return Ok(TakeRight(false));
                }

                Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
                    PrimitiveType::any,
                )))
            }
            (AnonymousType::Primitive(p2), AnonymousType::Literal(_, p), _) => {
                Ok(other.compose(&self, variance)?.flip_sides())
            }
            (
                AnonymousType::Primitive(p),
                AnonymousType::Primitive(p2),
                Variance::Covariant,
            ) => match (p, p2) {
                (PrimitiveType::any, PrimitiveType::any) => Ok(ComposeResult::TakeEither),
                (PrimitiveType::any, _) => Ok(TakeRight(false)),
                (_, PrimitiveType::any) => Ok(TakeLeft(false)),
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
                AnonymousType::Primitive(p),
                AnonymousType::Primitive(p2),
                Variance::Contravariant,
            ) => match (p, p2) {
                (PrimitiveType::any, PrimitiveType::any) => Ok(ComposeResult::TakeEither),
                (PrimitiveType::any, _) => Ok(TakeLeft(false)),
                (_, PrimitiveType::any) => Ok(TakeRight(false)),
                _ => {
                    if p == p2 {
                        return Ok(TakeEither);
                    }

                    Ok(WidenTo(AnonymousType::Primitive(
                        PrimitiveType::any,
                    )))
                }
            },
            (
                AnonymousType::Primitive(p),
                AnonymousType::Primitive(p2),
                Variance::Invariant,
            ) => {
                if p == p2 {
                    return Ok(TakeEither);
                }

                Err(format!(
                    "Differing primitives are not invariant: {:?} {:?}",
                    p, p2
                ))
            }
            (AnonymousType::Primitive(PrimitiveType::any), _, Variance::Contravariant) => {
                Ok(TakeLeft(false))
            }
            (_, AnonymousType::Primitive(PrimitiveType::any), Variance::Contravariant) => {
                Ok(TakeRight(false))
            }
            (AnonymousType::Primitive(PrimitiveType::any), _, Variance::Covariant) => {
                Ok(TakeRight(false))
            }
            (_, AnonymousType::Primitive(PrimitiveType::any), Variance::Covariant) => {
                Ok(TakeLeft(false))
            }
            (
                AnonymousType::Enum(options),
                AnonymousType::Enum(other_options),
                Variance::Covariant,
            ) => {
                if (options.len() > other_options.len()) {
                    match other.compose(self, variance)? {
                        TakeLeft(b) => Ok(TakeRight(b)),
                        TakeRight(_) => {
                            unreachable!("enum compose branch should not include TakeRight!")
                        }
                        result => Ok(result),
                    }
                } else {
                    let missing_options: Vec<&String> = options
                        .iter()
                        .filter(|i| !other_options.contains(i))
                        .collect();
                    if missing_options.len() == 0 {
                        if options.len() < other_options.len() {
                            return Ok(TakeLeft(false));
                        }

                        options.get(0).and_then(|head| {
                            other_options.get(0).map(|other_head| if head == other_head {
                                Ok(TakeEither)
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
                AnonymousType::Enum(options),
                AnonymousType::Enum(other_options),
                Variance::Contravariant,
            ) => {
                if options.len() < other_options.len() {
                    match other.compose(self, variance)? {
                        TakeLeft(b) => Ok(TakeRight(b)),
                        TakeRight(_) => {
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
                                            Some(Ok(TakeEither))
                                        } else {
                                            Some(Ok(TakeLeft(false)))
                                        }
                                    } else {
                                        None
                                    }
                                })
                            })
                            .unwrap_or(Ok(WidenTo(AnonymousType::Primitive(
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
                            Ok(WidenTo(AnonymousType::Enum(all_options)))
                        } else {
                            Ok(WidenTo(AnonymousType::Primitive(
                                PrimitiveType::any,
                            )))
                        }
                    }
                }
            }
            (
                AnonymousType::Enum(options),
                AnonymousType::Enum(other_options),
                Variance::Invariant,
            ) => (if other_options.iter().all(|i| options.contains(i))
                && options.len() == other_options.len()
            {
                options.get(0).and_then(|head| {
                    other_options.get(0).and_then(|other_head| {
                        if head == other_head {
                            if options.len() == other_options.len() {
                                Some(Ok(TakeEither))
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
                AnonymousType::Repeated(inner_kind_box),
                AnonymousType::Repeated(other_inner_kind_box),
                Variance::Covariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    TakeLeft(b) => Ok(TakeLeft(b)),
                    TakeRight(b) => Ok(TakeRight(b)),
                    TakeEither => Ok(TakeEither),
                    _ => Err(format!(
                        "Cannot compose container repeated if inner type would change"
                    )),
                }
            }
            (
                AnonymousType::Map(inner_kind_box),
                AnonymousType::Map(other_inner_kind_box),
                Variance::Covariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    TakeLeft(b) => Ok(TakeLeft(b)),
                    TakeRight(b) => Ok(TakeRight(b)),
                    TakeEither => Ok(TakeEither),
                    _ => Err(format!(
                        "Cannot compose container map if inner type would change"
                    )),
                }
            }
            (
                AnonymousType::Repeated(inner_kind_box),
                AnonymousType::Repeated(other_inner_kind_box),
                Variance::Contravariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    TakeLeft(b) => Ok(TakeLeft(b)),
                    TakeRight(b) => Ok(TakeRight(b)),
                    TakeEither => Ok(TakeEither),
                    _ => Ok(WidenTo(AnonymousType::Repeated(
                        Box::new(AnonymousType::Primitive(
                            PrimitiveType::any,
                        )),
                    ))),
                }
            }
            (
                AnonymousType::Map(inner_kind_box),
                AnonymousType::Map(other_inner_kind_box),
                Variance::Contravariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    TakeLeft(b) => Ok(TakeLeft(b)),
                    TakeRight(b) => Ok(TakeRight(b)),
                    TakeEither => Ok(TakeEither),
                    _ => Ok(ComposeResult::WidenTo(AnonymousType::Map(
                        Box::new(AnonymousType::Primitive(
                            PrimitiveType::any,
                        )),
                    ))),
                }
            }
            (
                AnonymousType::Repeated(inner_kind_box),
                AnonymousType::Repeated(other_inner_kind_box),
                Invariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                inner_kind.compose(&other_inner_kind, variance)
            }
            (
                AnonymousType::Map(inner_kind_box),
                AnonymousType::Map(other_inner_kind_box),
                Invariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                inner_kind.compose(&other_inner_kind, variance)
            }
            (
                AnonymousType::Fields(fields),
                AnonymousType::Fields(other_fields),
                _,
            ) => {
                let mut field_composer = FieldComposer::default();
                field_composer.compose_fields(fields, other_fields, variance)?;

                if fields.len() == other_fields.len()
                    && fields.keys().all(|k| other_fields.contains_key(k))
                {
                    if field_composer.left_preference.is_some() {
                        Ok(TakeLeft(false))
                    } else if field_composer.right_preference.is_some() {
                        Ok(TakeRight(false))
                    } else {
                        Ok(TakeEither)
                    }
                } else {
                    match variance {
                        Invariant => Err(format!("Existing fields were compatible, but new disjoint fields are not allowed in Invariant struct")),
                        _ => Ok(ComposeFields(field_composer.field_changes))
                    }
                }
            }
            (AnonymousType::Reference(_, inner), other, _) => {
                match inner.compose(&DenormalizedType::Anonymous(other.to_owned()), variance)? {
                    TakeEither => Ok(TakeLeft(false)),
                    result => Ok(result)
                }
            }
            (_, AnonymousType::Reference(_, other_inner), _) => {
                match DenormalizedType::Anonymous(self.to_owned()).compose(other_inner, variance)? {
                    TakeEither => Ok(TakeRight(false)),
                    result => Ok(result)
                }
            }
            (_, _, Covariant) => Err(format!(
                "Could not select narrow covariant amongst these types"
            )),
            (_, _, Invariant) => Err(format!("Types were not invariant")),
            (_, _, Contravariant) => Ok(WidenTo(
                AnonymousType::Primitive(PrimitiveType::any),
            )),
        }
    }
}

#[derive(Default)]
struct FieldComposer {
    left_preference: Option<String>,
    right_preference: Option<String>,
    field_changes: HashMap<String, Box<ComposeResult>>,
}

impl FieldComposer {
    fn compose_field(
        k: &String,
        left: &HashMap<String, Box<DenormalizedType>>,
        right: &HashMap<String, Box<DenormalizedType>>,
        variance: &Variance,
    ) -> Result<ComposeResult, String> {
        let v = left.get(k);
        if v.is_none() {
            match variance {
                Invariant => {
                    return Err(format!("Key {} was present in right, but not left type", k));
                }
                Contravariant => {
                    return Ok(ComposeResult::TakeRight(true));
                }
                Covariant => {
                    return Ok(ComposeResult::TakeRight(false));
                }
            }
        }

        let other_v = right.get(k);
        if other_v.is_none() {
            match variance {
                Invariant => {
                    return Err(format!("Key {} was present in left, but not right type", k));
                }
                Contravariant => {
                    return Ok(ComposeResult::TakeLeft(true));
                }
                Covariant => {
                    return Ok(ComposeResult::TakeLeft(false));
                }
            }
        }

        let v = v.unwrap().deref();
        let other_v = other_v.unwrap().deref();
        return v.compose(other_v, variance);
    }

    fn apply_field_composition(
        &mut self,
        k: &String,
        result: Result<ComposeResult, String>,
    ) -> Result<(), String> {
        let result = result?;

        match result {
            TakeLeft(false) => {
                if self.right_preference.is_some() {
                    return Err(format!("field {} on right hand side has different variance than field {} on the left.  Fields are not compatible", self.right_preference.to_owned().unwrap(), k));
                } else {
                    self.left_preference = Some(k.to_owned());
                }
            }
            TakeRight(false) => {
                if self.left_preference.is_some() {
                    return Err(format!("field {} on left hand side has different variance than field {} on the right.  Fields are not compatible", self.left_preference.to_owned().unwrap(), k));
                } else {
                    self.right_preference = Some(k.to_owned());
                }
            }
            _ => {}
        }

        self.field_changes.insert(k.to_owned(), Box::new(result));
        return Ok(());
    }

    fn compose_fields(
        &mut self,
        left: &HashMap<String, Box<DenormalizedType>>,
        right: &HashMap<String, Box<DenormalizedType>>,
        variance: &Variance,
    ) -> Result<(), String> {
        for k in left.keys().collect::<Vec<&String>>().iter().cloned() {
            self.apply_field_composition(
                k,
                FieldComposer::compose_field(k, left, right, variance),
            )?;
        }

        for k in right
            .keys()
            .cloned()
            .filter(|k| !left.contains_key(k))
            .collect::<Vec<String>>()
            .iter()
        {
            self.apply_field_composition(
                k,
                FieldComposer::compose_field(k, left, right, variance),
            )?;
        }

        return Ok(());
    }
}
