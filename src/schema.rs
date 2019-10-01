use crate::dep_mapper::DepMapper;
pub use crate::models::schema::*;
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
