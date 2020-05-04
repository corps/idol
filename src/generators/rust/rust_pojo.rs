use crate::deconstructors::{Optional, TypeDeconstructor, TypeStructDeconstructor};
use crate::generators::acc_monad::AccMonad;
use crate::generators::features::{Feature, Reserved};
use crate::generators::identifiers::{Escapable, Escaped, SlashComment};
use crate::generators::project::{Declared, ModuleContext, ProjectContext};
use crate::generators::rust::identifiers::{RustIdentifier, RustModuleName, RustModuleRoot};
use crate::generators::rust::rust_file::{
    import_from_crate, import_rust_declared, RustDeclarationMonad, RustDeclared, RustFile,
    RustImportMonad, RustModuleContext, RustProjectContext, RustProjectMonad, RustReserved,
};
use crate::models::schema::{Field, PrimitiveType, Reference, Type};
use crate::modules_store::{ModulesStore, TypeLookup};
use proc_macro2::TokenStream;
use quote::ToTokens;
use serde::export::fmt::Debug;
use serde::export::PhantomData;
use std::fmt::Display;

#[derive(Debug, Clone)]
pub struct RustPojo<R: RustPojoRenderable>(pub Reference, PhantomData<R>);

impl RustPojo<DefaultRustPojoRenderable> {
    pub fn new(reference: Reference) -> RustPojo<DefaultRustPojoRenderable> {
        RustPojo(reference, PhantomData)
    }
}

impl<'a, R: RustPojoRenderable + Debug + 'a> Feature<'a> for RustPojo<R> {
    type MI = RustModuleName;
    type I = RustIdentifier;
    type M = RustFile;
    type Declared = RustDeclared;
    type Reserved = RustReserved;
    type CG = TokenStream;
    type SC = TokenStream;

    fn reserve(
        &self,
    ) -> (
        Reserved<(Self::Declared, Self::Reserved)>,
        AccMonad<'a, Reserved<()>, ModuleContext<Self::MI, Self::I, Self::M>, String>,
    ) {
        self.reserve_identifier(RustIdentifier(self.0.type_name.clone()))
    }

    fn module(&self) -> Self::MI {
        RustModuleName::from_idol_module_name(RustModuleRoot::RootSelf, &self.0.module_name)
    }

    fn render(
        &self,
        store: &'a ModulesStore,
    ) -> RustDeclarationMonad<'a, Box<dyn Fn(RustReserved) -> (TokenStream, TokenStream) + 'a>>
    {
        AccMonad::from(store.lookup_reference(&self.0)).and_then(move |t: &Type| {
            R::field_definitions(store, t).map_optional(|fields| {
                fields.map(|fields| {
                    let v: Box<dyn Fn(RustReserved) -> (TokenStream, TokenStream)> = Box::new(move |(codegen_ident, scaffold_ident): RustReserved| -> (TokenStream, TokenStream) {
                        (
                            R::codegen_struct_type(codegen_ident.clone(), &fields),
                            quote! { pub type #scaffold_ident = #codegen_ident; },
                        )
                    });

                    v
                })
            })
        })
    }
}

pub trait RustPojoRenderable: Debug {
    fn codegen_struct_type<'a>(
        codegen_ident: Escaped<RustIdentifier>,
        fields: &Vec<TokenStream>,
    ) -> TokenStream {
        quote! {
            pub struct #codegen_ident {
                #(#fields),*
            }
        }
    }

    fn field_definitions<'a>(
        store: &'a ModulesStore,
        t: &'a Type,
    ) -> RustDeclarationMonad<'a, Vec<TokenStream>> {
        TypeDeconstructor(t)
            .struct_fields()
            .map(|fields| {
                RustDeclarationMonad::collect(
                    fields
                        .values()
                        .map(|field| Self::field_definition(store, field)),
                )
                .map(|fields| Some(AccMonad::collect(fields.iter().filter_map(|f| f.clone()))))
            })
            .unwrap_or_default()
    }

    fn field_definition<'a>(
        store: &'a ModulesStore,
        field: &'a Field,
    ) -> RustDeclarationMonad<'a, TokenStream> {
        Self::field_type(store, field).map_optional(move |acc| {
            let field_name = field.field_name.to_owned();
            let docs = field
                .docs
                .iter()
                .map(|s| SlashComment(s.to_string()).escape())
                .collect::<Vec<SlashComment>>();
            acc.map(move |field_type| {
                quote! {
                    #(#docs)
                    *
                    #field_name: #field_type
                }
            })
        })
    }

    fn field_type<'a>(
        store: &'a ModulesStore,
        field: &Field,
    ) -> RustDeclarationMonad<'a, TokenStream> {
        let ts_decon = TypeStructDeconstructor::from(field);

        let inner = ts_decon
            .contained()
            .and_then(|ts| {
                ts.primitive()
                    .map(|prim| Self::primitive_field_type(store, prim))
                    .or(ts
                        .reference()
                        .map(|r| Self::reference_field_type(store, r.to_owned())))
            })
            .unwrap_or_default();

        let struct_type = ts_decon
            .map()
            .map(|_| {
                inner.clone().and_then_optional(move |inner_type| {
                    Self::map_field_type(store).map_optional(move |map_type| {
                        inner_type
                            .clone()
                            .concat(map_type)
                            .map(|(inner_type, map_type)| {
                                quote! { #map_type<#inner_type> }
                            })
                    })
                })
            })
            .or(ts_decon.repeated().map(|_| {
                inner.clone().and_then_optional(move |inner_type| {
                    Self::repeated_field_type(store).map_optional(move |repeated_type| {
                        inner_type.clone().concat(repeated_type).map(
                            |(inner_type, repeated_type)| {
                                quote! { #repeated_type<#inner_type> }
                            },
                        )
                    })
                })
            }))
            .unwrap_or(inner.clone());

        if field.optional {
            struct_type.map_optional(|import_monad| {
                import_monad.map(|t| {
                    quote! { Option<#t> }
                })
            })
        } else {
            struct_type
        }
    }

    fn reference_field_type(
        store: &ModulesStore,
        reference: Reference,
    ) -> RustDeclarationMonad<TokenStream> {
        import_rust_declared(RustPojo::new(reference).declare(store))
    }

    fn primitive_field_type(
        store: &ModulesStore,
        prim: PrimitiveType,
    ) -> RustDeclarationMonad<TokenStream> {
        match prim {
            PrimitiveType::any => return Self::any_field_type(store),
            _ => {}
        }

        RustDeclarationMonad::deep_lift_some(move || match prim {
            PrimitiveType::string => quote! { String },
            PrimitiveType::int => quote! { i64 },
            PrimitiveType::bool => quote! { bool },
            PrimitiveType::double => quote! { f64 },
            PrimitiveType::any => unreachable!(),
        })
    }

    fn any_field_type(store: &ModulesStore) -> RustDeclarationMonad<TokenStream> {
        RustDeclarationMonad::lift_value(|| None)
    }

    fn map_field_type(store: &ModulesStore) -> RustDeclarationMonad<TokenStream> {
        import_from_crate("std", vec!["collections"], "HashMap")
    }

    fn repeated_field_type(store: &ModulesStore) -> RustDeclarationMonad<TokenStream> {
        RustDeclarationMonad::deep_lift_some(|| {
            quote! { Vec }
        })
    }
}

#[derive(Debug)]
pub struct DefaultRustPojoRenderable;
impl RustPojoRenderable for DefaultRustPojoRenderable {}
