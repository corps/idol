use crate::generators::acc_monad::AccMonad;
use crate::generators::identifiers::{CodegenIdentifier, Escapable, Escaped, ModuleIdentifier};
use crate::generators::project::{Declared, ModuleContext, ProjectContext};
use crate::generators::slotted_buffer::BufferManager;
use crate::modules_store::ModulesStore;
use proc_macro2::TokenStream;
use quote::ToTokens;
use std::fmt::{Debug, Display};

pub struct Reserved<T>(T);

impl<T: ToTokens> ToTokens for Reserved<T> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        self.0.to_tokens(tokens)
    }
}

pub trait Feature<'a>: Sized + Debug + 'a {
    type MI: ModuleIdentifier + 'a;
    type I: CodegenIdentifier + 'a;
    type M: BufferManager + 'a;
    type Declared: Clone + 'a;
    type Reserved: Clone + 'a;
    type CG: Display;
    type SC: Display;

    fn reserve(
        &self,
    ) -> (
        Reserved<(Self::Declared, Self::Reserved)>,
        AccMonad<'a, Reserved<()>, ModuleContext<Self::MI, Self::I, Self::M>, String>,
    );

    fn module(&self) -> Self::MI;

    fn render(
        &self,
        store: &'a ModulesStore,
    ) -> AccMonad<
        'a,
        Option<
            AccMonad<
                'a,
                Box<dyn Fn(Self::Reserved) -> (Self::CG, Self::SC) + 'a>,
                ModuleContext<Self::MI, Self::I, Self::M>,
                String,
            >,
        >,
        ProjectContext<Self::MI, Self::I, Self::M>,
        String,
    >;

    fn imperative(
        &self,
    ) -> (
        Reserved<((), ())>,
        AccMonad<'a, Reserved<()>, ModuleContext<Self::MI, Self::I, Self::M>, String>,
    ) {
        (Reserved(((), ())), AccMonad::lift_value(|| Reserved(())))
    }

    fn reserve_identifier(
        &self,
        ident: Self::I,
    ) -> (
        Reserved<(
            Declared<Self::MI, Self::I>,
            (Escaped<Self::I>, Escaped<Self::I>),
        )>,
        AccMonad<'a, Reserved<()>, ModuleContext<Self::MI, Self::I, Self::M>, String>,
    ) {
        let module_ident = self.module().escaped();
        let feature_name = format!("{:?}", self);
        let codegen_ident: Self::I = ident.codegen_variant();
        let ident = ident.clone().escaped();
        let codegen_ident = codegen_ident.escaped();

        (
            Reserved((
                Declared(module_ident.clone(), ident.clone()),
                (codegen_ident.clone(), ident.clone()),
            )),
            AccMonad::with_acc(move |mut m: ModuleContext<Self::MI, Self::I, Self::M>| {
                m.try_add_ident(&ident, &feature_name)?;
                m.try_add_ident(&codegen_ident, &format!("Codegen({})", &feature_name))?;

                Ok((m, Reserved(())))
            }),
        )
    }

    fn declare(
        self,
        store: &'a ModulesStore,
    ) -> AccMonad<
        'a,
        Option<AccMonad<'a, Self::Declared, ModuleContext<Self::MI, Self::I, Self::M>, String>>,
        ProjectContext<Self::MI, Self::I, Self::M>,
        String,
    > {
        let module_ident = self.module();
        let render_acc = self.render(store);

        render_acc.and_then(
            move |renderer: Option<
                AccMonad<
                    'a,
                    Box<dyn Fn(Self::Reserved) -> (Self::CG, Self::SC)>,
                    ModuleContext<Self::MI, Self::I, Self::M>,
                    String,
                >,
            >| {
                let feature_name = format!("{:?}", &self);
                let (reserved, reserve_acc) = self.reserve();
                let (declared, reserved) = reserved.0;

                if let Some(render_acc) = renderer {
                    ProjectContext::run_in_module(
                        module_ident.clone(),
                        AccMonad::with_acc(
                            move |mut m: ModuleContext<Self::MI, Self::I, Self::M>| {
                                if !m.rendered.insert(feature_name.clone()) {
                                    let m = reserve_acc.render(m)?;
                                    let (mut m, do_render) = render_acc.run(m)?;
                                    let (cg, sc) = do_render(reserved.clone());
                                    m.buffer.set_slot(&feature_name, cg, sc);
                                    return Ok((m, ()));
                                }

                                Ok((m, ()))
                            },
                        ),
                    )
                    .map(move |_| {
                        let declared = declared.clone();
                        Some(AccMonad::lift_value(move || declared.clone()))
                    })
                } else {
                    AccMonad::lift_value(|| None)
                }
            },
        )
    }
}

impl<'a, R: 'a, A: 'a, E: 'a> AccMonad<'a, Option<R>, A, E> {
    pub fn map_optional<S: 'a, F: Fn(R) -> S + 'a>(self, f: F) -> AccMonad<'a, Option<S>, A, E> {
        let f = move |r: Option<R>| {
            if let Some(inner) = r {
                Some(f(inner))
            } else {
                None
            }
        };

        self.map(f)
    }

    pub fn and_then_optional<S: 'a, F: Fn(R) -> AccMonad<'a, Option<S>, A, E> + 'a>(
        self,
        f: F,
    ) -> AccMonad<'a, Option<S>, A, E> {
        let f = move |r: Option<R>| {
            if let Some(inner) = r {
                f(inner)
            } else {
                AccMonad::lift_value(|| None)
            }
        };

        self.and_then(f)
    }
}
