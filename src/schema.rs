use crate::dep_mapper::DepMapper;
use crate::models::declarations::ModuleDec;
pub use crate::models::schema::*;
use crate::type_builder::TypeBuilder;
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
                    .filter(|dec| TypeBuilder::is_model_ref(dec))
                    .map(|s| {
                        (
                            Reference::from(format!("{}.{}", self.module_name, from_name).as_str()),
                            Reference::from(s.as_str()),
                        )
                    })
                    .collect::<Vec<(Reference, Reference)>>()
            })
            .collect();
    }

    pub fn order_local_dependencies(&mut self, module_dec: &ModuleDec) -> Result<(), String> {
        let mut dep_mapper = DepMapper::new();

        for r in self.get_all_declaration_dependencies(module_dec).iter() {
            if r.0.module_name == r.1.module_name {
                dep_mapper.add_dependency(r.0.type_name.to_owned(), r.1.type_name.to_owned())?;
            }
        }

        let ordered = dep_mapper.order_dependencies();

        let mut model_names: Vec<&String> = module_dec.0.keys().collect();
        model_names.sort();

        for model_name in model_names.iter().cloned() {
            if ordered.contains(model_name) {
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
