use crate::generators::escaped::Escaped;
use std::collections::HashMap;
use std::fmt::{Debug, Display};
use std::hash::Hash;
use std::io::{BufRead, BufReader, Read, Write};

pub trait Escaper {
    fn escape(&self, s: &str) -> String;
    fn try_unescape(&self, s: &str) -> Option<String>;
}

pub struct SlottedBuffer<E: Escaper> {
    escaper: E,
    header: String,
    slots: HashMap<String, (String, String)>,
    named_slot_write_order: Vec<String>,
}

impl<E: Escaper + Default> Default for SlottedBuffer<E> {
    fn default() -> Self {
        SlottedBuffer {
            escaper: E::default(),
            header: "".to_string(),
            slots: HashMap::new(),
            named_slot_write_order: vec![],
        }
    }
}

impl<E: Escaper + Default> SlottedBuffer<E> {
    pub fn set_slot(&mut self, slot_name: String, codegen: String, scaffold: String) {
        if !self.named_slot_write_order.contains(&slot_name) {
            self.named_slot_write_order.push(slot_name.clone());
        }

        let entry = self.slots.entry(slot_name);
        entry
            .and_modify(|(cg, sc)| {
                cg.clear();
                cg.push_str(&codegen)
            })
            .or_insert_with(|| (codegen, scaffold));
    }

    pub fn write<W: Write>(self, mut w: W) -> std::io::Result<()> {
        if !self.header.is_empty() {
            write!(w, "{}\n", self.header)?;
        }

        for slot_name in self.named_slot_write_order.iter() {
            let (cg, sc) = self.slots.get(slot_name).unwrap();
            write!(w, "{}\n", self.escaper.escape(slot_name))?;
            write!(w, "{}\n", cg)?;
            write!(w, "{}\n", self.escaper.escape("end"))?;

            if !sc.is_empty() {
                write!(w, "{}\n", sc)?;
            }
        }

        Ok(())
    }

    pub fn read_from<R: Read>(r: R) -> std::io::Result<SlottedBuffer<E>> {
        let mut slots = HashMap::new();
        let mut reader = BufReader::new(r);

        let mut line_buf = "".to_string();
        let mut cur_buf: String = "".to_string();
        let mut slot_buf = "".to_string();

        let mut parsing_header = true;
        let mut in_block = false;
        let mut header = "".to_string();
        let mut cur_slot = "".to_string();

        let escaper = E::default();

        while reader.read_line(&mut line_buf)? > 0 {
            if let Some(slot_name) = escaper.try_unescape(&line_buf) {
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
            escaper,
            header,
            slots,
            named_slot_write_order: vec![],
        })
    }
}
