use crate::dep_mapper::DepMapper;
use crate::err::FieldDecError;
use crate::models::declarations::{FieldDec, ModuleDec, TypeDec};
pub use crate::models::schema::*;
use crate::type_builder::TypeBuilder;
use regex::Regex;
use std::cmp::Ordering;
use std::fmt::Display;
use std::hash::{Hash, Hasher};

impl Hash for Reference {
    fn hash<H>(&self, state: &mut H)
    where
        H: Hasher,
    {
        self.qualified_name.hash(state);
    }
}

impl PartialOrd for Reference {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        return self.qualified_name.partial_cmp(&other.qualified_name);
    }
}

impl Ord for Reference {
    fn cmp(&self, other: &Self) -> Ordering {
        return self.qualified_name.cmp(&other.qualified_name);
    }

    fn max(self, other: Self) -> Self
    where
        Self: Sized,
    {
        if self.qualified_name.cmp(&other.qualified_name) == Ordering::Less {
            return other;
        }

        return self;
    }

    fn min(self, other: Self) -> Self
    where
        Self: Sized,
    {
        if self.qualified_name.cmp(&other.qualified_name) == Ordering::Greater {
            return other;
        }

        return self;
    }

    //    fn clamp(self, min: Self, max: Self) -> Self
    //    where
    //        Self: Sized,
    //    {
    //        if self.cmp(&min) == Ordering::Less {
    //            return min;
    //        }
    //        if self.cmp(&max) == Ordering::Greater {
    //            return min;
    //        }
    //
    //        return self;
    //    }
}

// Oh god oh no.  Until we can use a derive attribute on a struct declare in a separate module,
// we have to implement this by hand (even though explicitly this is prohibitted in the api)
impl Eq for Reference {
    fn assert_receiver_is_total_eq(&self) {}
}

impl TypeStruct {
    pub fn is_primitive(&self) -> bool {
        return self.reference.qualified_name.len() == 0;
    }

    pub fn is_reference(&self) -> bool {
        return !self.is_primitive();
    }

    pub fn literal_value(&self) -> serde_json::Value {
        let primitive_type = self.primitive_type.to_owned();

        (self.literal.to_owned()).map_or(serde_json::Value::Null, |literal| match primitive_type {
            PrimitiveType::any => unreachable!(),
            PrimitiveType::bool => serde_json::Value::from(literal.bool),
            PrimitiveType::int => serde_json::Value::from(literal.int),
            PrimitiveType::double => serde_json::Value::from(literal.double),
            PrimitiveType::string => serde_json::Value::from(literal.string.to_owned()),
        })
    }

    pub fn as_type_dec_str(&self) -> String {
        let mut ts_string = "".to_string();
        if !self.reference.empty() {
            ts_string += self.reference.qualified_name.as_str();
        } else if let Some(lit) = self.literal.clone() {
            ts_string += (match self.primitive_type {
                PrimitiveType::bool => format!("literal:bool:{}", lit.bool),
                PrimitiveType::int => format!("literal:int:{}", lit.int),
                PrimitiveType::double => format!("literal:double:{}", lit.double),
                PrimitiveType::string => format!("literal:string:{}", lit.string),
                _ => unreachable!("any is not allowed in a literal type struct"),
            })
            .as_str();
        } else {
            ts_string += format!("{:?}", self.primitive_type).as_str();
        }

        match self.struct_kind {
            StructKind::Repeated => {
                ts_string += "[]";
            }
            StructKind::Map => {
                ts_string += "[]";
            }
            _ => {}
        }

        return ts_string;
    }
}

impl Type {
    pub fn is_type_alias(&self) -> bool {
        return self.is_a.is_some();
    }
    pub fn is_enum(&self) -> bool {
        return !self.is_type_alias() && self.options.len() > 0;
    }
    pub fn is_struct(&self) -> bool {
        return !self.is_type_alias() && !self.is_enum();
    }

    pub fn as_typedec(&self) -> TypeDec {
        let mut result = TypeDec::default();

        if let Some(type_struct) = self.is_a.clone() {
            result.is_a = vec![type_struct.as_type_dec_str()];
        }

        for (k, v) in self.fields.iter() {
            let mut field_parts = vec![v.type_struct.as_type_dec_str()];
            field_parts.extend(v.tags.iter().cloned());
            result.fields.insert(k.to_owned(), FieldDec(field_parts));
        }

        result.r#enum = self.options.clone();
        result.tags = self.tags.clone();

        return result;
    }
}

impl From<&str> for Reference {
    fn from(reference_label: &str) -> Reference {
        let mut dotted_parts = reference_label.split('.');
        let type_name = dotted_parts.next_back().unwrap();

        Reference {
            qualified_name: reference_label.to_owned(),
            type_name: type_name.to_owned(),
            module_name: dotted_parts.collect::<Vec<&str>>().join("."),
        }
    }
}

impl Reference {
    pub fn empty(&self) -> bool {
        return self.type_name.len() == 0;
    }
}

impl Display for Reference {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.qualified_name)
    }
}

impl Module {
    pub fn get_all_declaration_dependencies(
        &self,
        module_dec: &ModuleDec,
    ) -> Vec<(Reference, Reference)> {
        let qualifier = ModuleQualifier(self.module_name.to_owned());
        let mut model_names: Vec<&String> = module_dec.0.keys().collect();
        model_names.sort();

        return model_names
            .iter()
            .cloned()
            .map(|from_name| (from_name, module_dec.0.get(from_name).unwrap()))
            .map(|(from_name, type_dec)| {
                let mut field_names = type_dec.fields.keys().cloned().collect::<Vec<String>>();
                field_names.sort();
                (from_name, type_dec, field_names)
            })
            .flat_map(|(from_name, type_dec, field_names)| {
                type_dec
                    .is_a
                    .iter()
                    .chain(
                        field_names.iter().filter_map(|name| {
                            type_dec.fields.get(name).and_then(|dec| dec.0.get(0))
                        }),
                    )
                    .filter(|dec| is_model_ref(dec))
                    .filter_map(|dec| {
                        parse_type_struct(&qualifier, dec)
                            .ok()
                            .map(|ts| ts.reference)
                    })
                    .map(|to_name| {
                        (
                            Reference::from(qualifier.qualify(from_name).as_str()),
                            to_name,
                        )
                    })
                    .collect::<Vec<(Reference, Reference)>>()
            })
            .collect();
    }

    pub fn order_local_dependencies(&mut self, module_dec: &ModuleDec) -> Result<(), String> {
        let mut dep_mapper = DepMapper::new();

        for r in self.get_all_declaration_dependencies(module_dec).iter() {
            if r.0.module_name == self.module_name && r.0.module_name == r.1.module_name {
                dep_mapper.add_dependency(r.0.type_name.to_owned(), r.1.type_name.to_owned())?;
            }
        }

        let ordered = dep_mapper.order_dependencies();

        let mut model_names: Vec<&String> = module_dec.0.keys().collect();
        model_names.sort();

        for model_name in model_names.iter().cloned() {
            if ordered.contains(model_name) || !module_dec.0.contains_key(model_name) {
                continue;
            }
            self.types_dependency_ordering.push(model_name.to_owned());
        }

        for model_name in ordered {
            self.types_dependency_ordering.push(model_name);
        }

        Ok(())
    }
}

pub(crate) fn parse_type_struct(
    qualifier: &ModuleQualifier,
    field_val: &str,
) -> Result<TypeStruct, FieldDecError> {
    let (mut type_struct, unused) = parse_type_annotation(field_val)?;

    if let Some(field_val) = unused {
        if is_model_ref(field_val) {
            type_struct.reference = Reference::from(qualifier.qualify(field_val).as_ref());
        } else {
            type_struct.primitive_type = parse_primitive_type(field_val)?;
        }
    }

    return Ok(type_struct);
}

pub(crate) fn parse_type_annotation(
    field_val: &str,
) -> Result<(TypeStruct, Option<&str>), FieldDecError> {
    lazy_static! {
        static ref TYPE_ANNOTATION_REGEX: Regex =
            Regex::new(r"^literal:(.*):(.*)$|(.+)\{\}$|(.+)\[\]$").unwrap();
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
        })
        .or_else(|| Some(Ok((TypeStruct::default(), Some(field_val)))))
        .unwrap()
}

pub(crate) fn parse_literal_annotation<'x>(
    lit_type: &'x str,
    val: &'x str,
) -> Result<TypeStruct, FieldDecError> {
    let mut result = TypeStruct::default();
    result.struct_kind = StructKind::Scalar;
    result.primitive_type = parse_primitive_type(lit_type)?;

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

pub(crate) fn parse_primitive_type(prim_kind: &str) -> Result<PrimitiveType, FieldDecError> {
    serde_json::from_value(serde_json::Value::String(prim_kind.to_owned()))
        .map_err(|e| FieldDecError::UnknownPrimitiveType(e.to_string()))
}

pub fn is_model_ref(type_val: &str) -> bool {
    return type_val.chars().next().unwrap_or(' ').is_ascii_uppercase()
        || type_val.find('.').is_some();
}

pub fn is_local_model_ref(type_val: &str) -> bool {
    return is_model_ref(type_val) && type_val.find('.').is_none();
}

pub(crate) struct ModuleQualifier(pub String);

impl ModuleQualifier {
    pub fn qualify(&self, name: &str) -> String {
        if name.find(".").is_some() {
            return name.to_owned();
        }

        if name.chars().next().unwrap_or(' ').is_ascii_uppercase() {
            return format!("{}.{}", self.0, name);
        }

        return name.to_owned();
    }
}
