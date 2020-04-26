use crate::dep_mapper::DepMapper;
use serde::export::PhantomData;
use std::collections::HashMap;
use std::fmt::{Debug, Display};
use std::io::{BufRead, BufReader, Read, Write};

pub trait BufferManager {
    fn escape(s: &str) -> String;
    fn try_unescape(s: &str) -> Option<String>;
}

pub struct SlottedBuffer<M: BufferManager + ?Sized> {
    header: String,
    slots: HashMap<String, (String, String)>,
    slot_dep_mapper: DepMapper,
    manager: PhantomData<M>,
}

impl<M: BufferManager> Default for SlottedBuffer<M> {
    fn default() -> Self {
        SlottedBuffer {
            header: "".to_string(),
            slots: HashMap::new(),
            slot_dep_mapper: DepMapper::new(),
            manager: PhantomData,
        }
    }
}

impl<M: BufferManager> SlottedBuffer<M> {
    pub fn order_slot<Slot: Debug, Dep: Debug>(
        &mut self,
        slot: Slot,
        dependency: Dep,
    ) -> Result<(), String> {
        let slot_name = format!("{:?}", slot);
        let dependency = format!("{:?}", dependency);

        self.slot_dep_mapper.add_dependency(&slot_name, &dependency)
    }

    pub fn set_slot<CG: Display, SC: Display>(
        &mut self,
        slot_name: &str,
        codegen: CG,
        scaffold: SC,
    ) {
        if let Some((cg, _)) = self.slots.get_mut(slot_name) {
            *cg = format!("{}", codegen);
        } else {
            self.slots.insert(
                slot_name.to_owned(),
                (format!("{}", codegen), format!("{}", scaffold)),
            );
        }
    }

    pub fn append_slot<Slot: Debug, CG: Display, SC: Display>(
        &mut self,
        slot: Slot,
        codegen: CG,
        scaffold: SC,
    ) {
    }

    pub fn write<W: Write>(self, mut w: W) -> std::io::Result<()> {
        if !self.header.is_empty() {
            write!(w, "{}\n", self.header)?;
        }

        for slot_name in self.slot_dep_mapper.order_dependencies() {
            if let Some((cg, sc)) = self.slots.get(&slot_name) {
                write!(w, "{}\n", M::escape(&slot_name))?;
                write!(w, "{}\n", cg)?;
                write!(w, "{}\n", M::escape("end"))?;

                if !sc.is_empty() {
                    write!(w, "{}\n", sc)?;
                }
            }
        }

        Ok(())
    }

    pub fn read_from<R: Read>(r: R) -> std::io::Result<SlottedBuffer<M>> {
        let mut slots = HashMap::new();
        let mut reader = BufReader::new(r);

        let mut line_buf = "".to_string();
        let mut cur_buf: String = "".to_string();
        let mut slot_buf = "".to_string();

        let mut parsing_header = true;
        let mut in_block = false;
        let mut header = "".to_string();
        let mut cur_slot = "".to_string();

        while reader.read_line(&mut line_buf)? > 0 {
            if let Some(slot_name) = M::try_unescape(&line_buf) {
                if parsing_header {
                    header = cur_buf.clone();
                    cur_buf.clear();
                    parsing_header = false;
                    cur_slot = slot_name;
                    in_block = true;
                    continue;
                }

                if in_block {
                    slot_buf = cur_buf.clone();
                    cur_buf.clear();

                    in_block = false;
                } else {
                    // Boundary marking a new slot.
                    slots.insert(cur_slot, (slot_buf.clone(), cur_buf.clone()));
                    cur_buf.clear();
                    cur_slot = slot_name;

                    in_block = true;
                }
            } else {
                cur_buf += &line_buf;
                cur_buf += "\n";
            }
        }

        if !parsing_header {
            if in_block {
                cur_buf.clear();
            }

            slots.insert(cur_slot, (slot_buf.clone(), cur_buf.clone()));
        }

        Ok(SlottedBuffer {
            header,
            slots,
            slot_dep_mapper: DepMapper::new(),
            manager: PhantomData,
        })
    }
}
