use crate::deconstructors::{TypeDeconstructor, TypeStructDeconstructor};
use crate::generators::declarable::Declarable;
use crate::generators::rust::identifiers::{RustIdentifier, RustModuleName};
use crate::generators::rust::RustEscaper;
use crate::generators::Generator;
use crate::models::schema::Reference;
use crate::modules_store::TypeLookup;

#[derive(Debug)]
pub struct TypeDeclarable(Reference);

impl Declarable<RustEscaper, String, String, RustModuleName, RustIdentifier> for TypeDeclarable {
    fn render(
        &self,
        generator: &mut Generator<'_, RustEscaper>,
    ) -> Result<(String, String), String> {
        let t = generator.module_store.lookup_reference(&self.0)?;

        if let Some(fields) = TypeDeconstructor(t).struct_fields() {
            for (field_name, field) in fields.iter() {
                if let Some(inner_ref) =
                    TypeStructDeconstructor(&field.type_struct, field.optional.into())
                        .contained()
                        .and_then(|s| s.reference())
                {
                    // let field_type = generator.module_store.lookup_reference(&inner_ref)?;
                    let (mi, i) = generator.declare(TypeDeclarable(inner_ref.clone()))?;
                }
            }
        }

        unimplemented!()
    }

    fn identifiers(&self) -> (RustModuleName, RustIdentifier) {
        unimplemented!()
    }
}
