use crate::err::{FieldDecError, TypeDecError};
use crate::models::declarations::Variance;
use crate::schema::{PrimitiveType, StructKind, TypeStruct};
use crate::type_builder::denormalized::{AnonymousType, ComposeResult, DenormalizedType};

impl Variance {
    fn flip(&self) -> Variance {
        match self {
            Variance::Covariant => Variance::Contravariant,
            Variance::Contravariant => Variance::Covariant,
            Variance::Invariant => Variance::Invariant,
        }
    }
}

impl DenormalizedType {
    pub fn compose(&self, other: &Self, variance: &Variance) -> Result<ComposeResult, String> {
        return match (self, other) {
            (DenormalizedType::Annotated(inner), DenormalizedType::Annotated(other_inner)) => {
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
                            _ => Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
                                PrimitiveType::any,
                            ))),
                        }
                    }
                }
            }
            // int' str
            (DenormalizedType::Annotated(inner), DenormalizedType::Anonymous(other_inner)) => {
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
                        _ => Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
                            PrimitiveType::any,
                        ))),
                    },
                }
            }
            (DenormalizedType::Anonymous(inner), DenormalizedType::Annotated(other_inner)) => {
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
                                Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
                                    PrimitiveType::any,
                                )))
                            }
                        }
                    }
                }
            }
            (DenormalizedType::Anonymous(inner), DenormalizedType::Anonymous(other_inner)) => {
                inner.compose(&other_inner, variance)
            }
        };
    }

    pub fn has_specialization(tags: &Vec<String>) -> bool {
        tags.iter().any(|i| !i.contains(":"))
    }

    pub fn apply_compose_fields(
        left: &DenormalizedType,
        right: &DenormalizedType,
        fields_result: &HashMap<String, Box<ComposeResult>>,
    ) -> Result<DenormalizedType, TypeDecError> {
        match (left, right) {
            (DenormalizedType::Anonymous(AnonymousType::Fields(left_fields)), DenormalizedType::Anonymous(AnonymousType::Fields(right_fields))) => {
                let mut result_fields: HashMap<String, Box<DenormalizedType>> = HashMap::new();

                for (k, v) in fields_result.iter() {
                    match v.deref() {
                        ComposeResult::TakeLeft => {
                            result_fields.insert(k.to_owned(), left_fields.get(k).unwrap().to_owned());
                        }
                        ComposeResult::TakeEither => {
                            result_fields.insert(k.to_owned(), left_fields.get(k).unwrap().to_owned());
                        }
                        ComposeResult::TakeRight => {
                            result_fields.insert(k.to_owned(), right_fields.get(k).unwrap().to_owned());
                        }
                        ComposeResult::WidenTo(t) => {
                            result_fields.insert(k.to_owned(), Box::new(DenormalizedType::Anonymous(t.to_owned())));
                        }
                        ComposeResult::ComposeFields(_) => {
                            return Err(TypeDecError::FieldError(k.to_owned(), FieldDecError::CompositionError(format!("field requires further struct merging, but recursive struct merging is not allowed."))));
                        }
                    }
                }

                Ok(DenormalizedType::Anonymous(AnonymousType::Fields(result_fields)))
            },
            _ => unreachable!("ComposeFields result should only have been returned from composing two fields kinds!"),
        }
    }
}

impl AnonymousType {
    fn compose(&self, other: &Self, variance: &Variance) -> Result<ComposeResult, String> {
        match (self, other, variance.to_owned()) {
            (AnonymousType::Literal(v, p), AnonymousType::Literal(v2, p2), _) => {
                if p == p2 && v == v2 {
                    return Ok(ComposeResult::TakeEither);
                }

                Err("Two literals with differing values cannot compose".to_string())
            }
            (
                AnonymousType::Literal(_, p),
                AnonymousType::Primitive(p2),
                Variance::Covariant,
            ) => {
                match AnonymousType::Primitive(p.to_owned()).compose(&other, variance)? {
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
                AnonymousType::Literal(_, p),
                AnonymousType::Primitive(p2),
                Variance::Contravariant,
            ) => {
                if p == p2 {
                    return Ok(ComposeResult::TakeRight);
                }

                Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
                    PrimitiveType::any,
                )))
            }
            (AnonymousType::Primitive(p2), AnonymousType::Literal(_, p), _) => {
                match other.compose(&self, variance)? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeLeft),
                    c => Ok(c),
                }
            }
            (
                AnonymousType::Primitive(p),
                AnonymousType::Primitive(p2),
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
                AnonymousType::Primitive(p),
                AnonymousType::Primitive(p2),
                Variance::Contravariant,
            ) => match (p, p2) {
                (PrimitiveType::any, PrimitiveType::any) => Ok(ComposeResult::TakeEither),
                (PrimitiveType::any, _) => Ok(ComposeResult::TakeLeft),
                (_, PrimitiveType::any) => Ok(ComposeResult::TakeRight),
                _ => {
                    if p == p2 {
                        return Ok(ComposeResult::TakeEither);
                    }

                    Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
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
                    return Ok(ComposeResult::TakeEither);
                }

                Err(format!(
                    "Differing primitives are not invariant: {:?} {:?}",
                    p, p2
                ))
            }
            (AnonymousType::Primitive(PrimitiveType::any), _, Variance::Contravariant) => {
                Ok(ComposeResult::TakeLeft)
            }
            (_, AnonymousType::Primitive(PrimitiveType::any), Variance::Contravariant) => {
                Ok(ComposeResult::TakeRight)
            }
            (AnonymousType::Primitive(PrimitiveType::any), _, Variance::Covariant) => {
                Ok(ComposeResult::TakeRight)
            }
            (_, AnonymousType::Primitive(PrimitiveType::any), Variance::Covariant) => {
                Ok(ComposeResult::TakeLeft)
            }
            (
                AnonymousType::Enum(options),
                AnonymousType::Enum(other_options),
                Variance::Covariant,
            ) => {
                if (options.len() > other_options.len()) {
                    match other.compose(self, variance)? {
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
                AnonymousType::Enum(options),
                AnonymousType::Enum(other_options),
                Variance::Contravariant,
            ) => {
                if options.len() < other_options.len() {
                    match other.compose(self, variance)? {
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
                            .unwrap_or(Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
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
                            Ok(ComposeResult::WidenTo(AnonymousType::Enum(all_options)))
                        } else {
                            Ok(ComposeResult::WidenTo(AnonymousType::Primitive(
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
                AnonymousType::Repeated(_, inner_kind_box),
                AnonymousType::Repeated(_, other_inner_kind_box),
                Variance::Covariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Err(format!(
                        "Cannot compose container repeated if inner type would change"
                    )),
                }
            }
            (
                AnonymousType::Map(_, inner_kind_box),
                AnonymousType::Map(_, other_inner_kind_box),
                Variance::Covariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Err(format!(
                        "Cannot compose container map if inner type would change"
                    )),
                }
            }
            (
                AnonymousType::Repeated(_, inner_kind_box),
                AnonymousType::Repeated(_, other_inner_kind_box),
                Variance::Contravariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Ok(ComposeResult::WidenTo(AnonymousType::Repeated(
                        TypeStruct {
                            primitive_type: PrimitiveType::any,
                            struct_kind: StructKind::Repeated,
                            ..TypeStruct::default()
                        },
                        Box::new(DenormalizedType::Anonymous(AnonymousType::Primitive(
                            PrimitiveType::any,
                        ))),
                    ))),
                }
            }
            (
                AnonymousType::Map(_, inner_kind_box),
                AnonymousType::Map(_, other_inner_kind_box),
                Variance::Contravariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                match inner_kind.compose(other_inner_kind, variance)? {
                    ComposeResult::TakeLeft => Ok(ComposeResult::TakeLeft),
                    ComposeResult::TakeRight => Ok(ComposeResult::TakeRight),
                    ComposeResult::TakeEither => Ok(ComposeResult::TakeEither),
                    _ => Ok(ComposeResult::WidenTo(AnonymousType::Map(
                        TypeStruct {
                            primitive_type: PrimitiveType::any,
                            struct_kind: StructKind::Map,
                            ..TypeStruct::default()
                        },
                        Box::new(DenormalizedType::Anonymous(AnonymousType::Primitive(
                            PrimitiveType::any,
                        ))),
                    ))),
                }
            }
            (
                AnonymousType::Repeated(_, inner_kind_box),
                AnonymousType::Repeated(_, other_inner_kind_box),
                Variance::Invariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                inner_kind.compose(&other_inner_kind, variance)
            }
            (
                AnonymousType::Map(_, inner_kind_box),
                AnonymousType::Map(_, other_inner_kind_box),
                Variance::Invariant,
            ) => {
                let inner_kind = inner_kind_box.deref();
                let other_inner_kind = other_inner_kind_box.deref();
                inner_kind.compose(&other_inner_kind, variance)
            }
            (
                AnonymousType::Fields(fields),
                AnonymousType::Fields(other_fields),
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
                    let composed = v.compose(other_v, variance)?;

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
                    let composed = other_v.compose(v, variance)?;

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
                AnonymousType::Primitive(PrimitiveType::any),
            )),
        }
    }
}
