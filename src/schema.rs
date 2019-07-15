use crate::dep_mapper::DepMapper;
pub use crate::models::schema::*;
use std::collections::HashMap;
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
  pub fn apply_type_parameters(&mut self, type_parameters: &HashMap<&String, &Reference>) {
    if let Some(replacement) = self.reference.find_appliable_parameter(type_parameters) {
      self.reference = replacement;
    }

    for i in 0..self.parameters.len() {
      if let Some(replacement) = self.parameters[i].find_appliable_parameter(type_parameters) {
        self.parameters[i] = replacement;
      }
    }
  }

  pub fn is_primitive(&self) -> bool {
    return self.reference.qualified_name.len() == 0;
  }

  pub fn is_reference(&self) -> bool {
    return !self.is_primitive();
  }

  pub fn is_abstraction(&self) -> bool {
    return self.parameters.len() > 0;
  }

  pub fn as_dependency_from(&self, from: &Reference) -> Option<Dependency> {
    if self.reference.empty() {
      return None;
    }

    return Some(Dependency {
      is_abstraction: self.is_abstraction(),
      ..from.dependency_to(&self.reference)
    });
  }

  pub fn literal_value(&self) -> serde_json::Value {
    match self.primitive_type {
      PrimitiveType::any => unreachable!(),
      PrimitiveType::bool => serde_json::Value::from(self.literal_bool),
      PrimitiveType::int64 => serde_json::Value::from(self.literal_int64),
      PrimitiveType::int53 => serde_json::Value::from(self.literal_int53.0),
      PrimitiveType::double => serde_json::Value::from(self.literal_double),
      PrimitiveType::string => serde_json::Value::from(self.literal_string.to_owned()),
    }
  }

  pub fn paramaterized(&self) -> bool {
    return self.parameters.len() > 0;
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

  pub fn is_abstract(&self) -> bool {
    return self.type_vars.len() > 0;
  }

  pub fn resolve_abstraction(&self, abstract_base: &Type) -> Result<Type, String> {
    let is_a = &self.is_a;

    if self.is_a.is_none() {
      return Err("generics only supported in `is_a` type aliases".to_string());
    }

    let is_a = is_a.clone().unwrap();

    if abstract_base.type_vars.len() != is_a.parameters.len() {
      return Err(format!(
        "generic parameter count mismatch: expected {} found {}",
        abstract_base.type_vars.len(),
        is_a.parameters.len()
      ));
    }

    let mut new = abstract_base.clone();
    new.type_name = self.type_name.to_owned();
    new.tags = self.tags.to_owned();
    new.type_vars = self.type_vars.to_owned();

    let mut parameters: HashMap<&String, &Reference> = HashMap::new();
    for i in 0..abstract_base.type_vars.len() {
      let k = abstract_base.type_vars.get(i).unwrap();
      let v = is_a.parameters.get(i).unwrap();
      parameters.insert(k, v);
    }

    if let Some(is_a) = new.is_a.as_mut() {
      is_a.apply_type_parameters(&parameters);
    } else {
      for field_name in abstract_base.fields.keys() {
        let new_field = new.fields.get_mut(field_name).unwrap();
        new_field.type_struct.apply_type_parameters(&parameters);
      }
    }

    Ok(new)
  }

  pub fn inner_structs<'a>(&'a self) -> Vec<&'a TypeStruct> {
    let mut result = vec![];

    if let Some(is_a) = &self.is_a {
      result.push(is_a);
    }

    let mut field_names: Vec<&String> = self.fields.keys().collect();
    field_names.sort();
    for field_name in field_names {
      let field = self.fields.get(field_name).unwrap();
      result.push(&field.type_struct);
    }

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
  pub fn dependency_to(&self, other: &Reference) -> Dependency {
    Dependency {
      from: self.clone(),
      to: other.clone(),
      is_local: self.module_name == other.module_name,
      is_abstraction: false,
    }
  }

  pub fn empty(&self) -> bool {
    return self.type_name.len() == 0;
  }

  pub fn is_type_param(&self) -> bool {
    return self.module_name.len() == 0;
  }

  pub fn find_appliable_parameter(
    &mut self,
    parameters: &HashMap<&String, &Reference>,
  ) -> Option<Reference> {
    if self.is_type_param() {
      return parameters.get(&self.type_name).map(|r| r.clone().clone());
    }

    None
  }
}

impl Display for Reference {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    write!(f, "{}", self.qualified_name)
  }
}

impl Module {
  pub fn order_local_dependencies(&mut self) -> Result<(), String> {
    let mut dep_mapper = DepMapper::new();
    let mut model_names: Vec<&String> = self.types_by_name.keys().collect();
    model_names.sort();

    for dependency in self.dependencies.iter() {
      if dependency.is_local {
        dep_mapper.add_dependency(
          dependency.from.type_name.to_owned(),
          dependency.to.type_name.to_owned(),
        )?;
      }
    }

    let ordered = dep_mapper.order_dependencies();
    for model_name in model_names.iter().cloned() {
      if ordered.contains(model_name) || !self.types_by_name.contains_key(model_name) {
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
