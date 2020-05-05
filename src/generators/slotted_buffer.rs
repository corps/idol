use serde::export::PhantomData;
use std::collections::HashMap;
use std::fmt::Display;
use std::fs::File;
use std::io::{BufRead, BufReader, Read, Write};
use std::path::PathBuf;

pub trait BufferManager {
    fn escape(s: &str) -> String;
    fn try_unescape(s: &str) -> Option<String>;
}

pub struct SlottedBuffer<M: BufferManager + ?Sized> {
    header: String,
    slots: HashMap<String, (String, String)>,
    insertion_order: Vec<String>,
    manager: PhantomData<M>,
}

impl<M: BufferManager> Default for SlottedBuffer<M> {
    fn default() -> Self {
        SlottedBuffer {
            header: "".to_string(),
            insertion_order: vec![],
            slots: HashMap::new(),
            manager: PhantomData,
        }
    }
}

impl<M: BufferManager> SlottedBuffer<M> {
    pub fn update_from_existing(&mut self, header_and_scaffold: (String, HashMap<String, String>)) {
        let (header, scaffolds) = header_and_scaffold;
        self.header = header;

        for k in self.insertion_order.iter() {
            if let Some(v) = scaffolds.get(k) {
                if let Some((_, sc)) = self.slots.get_mut(k) {
                    *sc = v.clone();
                }
            }
        }
    }

    pub fn set_slot<S: Display>(&mut self, slot_name: &str, codegen: S, scaffold: S) {
        let insertion_slot_name = slot_name.to_string();
        if !self.insertion_order.contains(&insertion_slot_name) {
            self.insertion_order.push(insertion_slot_name);
        }

        if let Some((cg, _)) = self.slots.get_mut(slot_name) {
            *cg = format!("{}\n", codegen);
        } else {
            self.slots.insert(
                slot_name.to_owned(),
                (format!("{}\n", codegen), format!("{}\n", scaffold)),
            );
        }
    }

    pub fn prepend_slot<S: Display>(&mut self, slot_name: &str, codegen: S, scaffold: S) {
        let insertion_slot_name = slot_name.to_string();
        if !self.insertion_order.contains(&insertion_slot_name) {
            self.insertion_order.insert(0, insertion_slot_name);
        }

        if let Some((cg, _)) = self.slots.get_mut(slot_name) {
            *cg = format!("{}\n", codegen);
        } else {
            self.slots.insert(
                slot_name.to_owned(),
                (format!("{}\n", codegen), format!("{}\n", scaffold)),
            );
        }
    }

    pub fn write<W: Write>(self, w: &mut W) -> std::io::Result<()> {
        if !self.header.is_empty() {
            write!(w, "{}", self.header)?;
        }

        for slot_name in self.insertion_order.iter() {
            if let Some((cg, sc)) = self.slots.get(slot_name) {
                write!(w, "{}\n", M::escape(&slot_name))?;
                write!(w, "{}", cg)?;
                write!(w, "{}\n", M::escape("end"))?;

                if !sc.is_empty() {
                    write!(w, "{}", sc)?;
                }
            }
        }

        Ok(())
    }

    pub fn update_from_target(&mut self, target_path: PathBuf) -> std::io::Result<()> {
        if target_path.exists() {
            let f = File::open(target_path)?;
            let (header, scaffolds) = Self::read_scaffolds_from(f)?;

            self.header = header;
            for slot_name in self.insertion_order.iter() {
                if let Some(v) = scaffolds.get(slot_name) {
                    if let Some((_, sc)) = self.slots.get_mut(slot_name) {
                        *sc = v.to_owned();
                    }
                }
            }
        }

        Ok(())
    }

    // Could be greatly simplified, this was butchered from an existing implementation with more
    // logic that doesn't exist now.
    pub fn read_scaffolds_from<R: Read>(
        r: R,
    ) -> std::io::Result<(String, HashMap<String, String>)> {
        let mut slots = HashMap::new();
        let mut reader = BufReader::new(r);

        let mut line_buf = "".to_string();
        let mut cur_buf: String = "".to_string();

        let mut parsing_header = true;
        let mut in_block = false;
        let mut header = "".to_string();
        let mut cur_slot = "".to_string();

        while reader.read_line(&mut line_buf)? > 0 {
            if let Some(slot_name) = M::try_unescape(&line_buf) {
                line_buf.clear();
                if parsing_header {
                    header = cur_buf.clone();
                    cur_buf.clear();
                    parsing_header = false;
                    cur_slot = slot_name;
                    in_block = true;
                    continue;
                }

                if in_block {
                    cur_buf.clear();
                    in_block = false;
                } else {
                    // Boundary marking a new slot.
                    slots.insert(cur_slot, cur_buf.clone());
                    cur_buf.clear();
                    cur_slot = slot_name;

                    in_block = true;
                }
            } else {
                cur_buf += &line_buf;
                line_buf.clear();
            }
        }

        if !parsing_header {
            if in_block {
                cur_buf.clear();
            }

            slots.insert(cur_slot, cur_buf.clone());
        }

        Ok((header, slots))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::generators::rust::rust_file::RustFile;

    #[test]
    fn test_add() {
        let mut b: SlottedBuffer<RustFile> = SlottedBuffer::default();
        b.set_slot("slot_one", "Codegen\nlines\n", "Scaffold\nlines");
        b.set_slot("slot_two", "", "");
        b.set_slot("slot_three", "", "Scaffold\nlines");
        b.set_slot("slot_four", "Codegen\nlines\n", "");

        let mut file: Vec<u8> = Vec::new();
        b.write(&mut file).unwrap();

        let mut file2: Vec<u8> = "Header\nlines\n".into();
        file2.extend_from_slice(&mut file);

        let (header, mut slots) =
            SlottedBuffer::<RustFile>::read_scaffolds_from(file2.as_slice()).unwrap();

        assert_eq!(header, "Header\nlines\n");
        assert_eq!(slots.get("slot_one").unwrap(), "Scaffold\nlines\n");
        assert_eq!(slots.get("slot_two").unwrap(), "\n");
        assert_eq!(slots.get("slot_three").unwrap(), "Scaffold\nlines\n");
        assert_eq!(slots.get("slot_four").unwrap(), "\n");

        slots.insert("slot_one".to_string(), "Updated\nScaffold\n".to_string());

        let mut b: SlottedBuffer<RustFile> = SlottedBuffer::default();
        b.update_from_existing((header, slots));

        let mut file: Vec<u8> = Vec::new();
        b.write(&mut file).unwrap();

        let (header, mut slots) =
            SlottedBuffer::<RustFile>::read_scaffolds_from(file2.as_slice()).unwrap();

        assert_eq!(header, "Header\nlines\n");
        assert_eq!(slots.get("slot_one").unwrap(), "Scaffold\nlines\n");
        assert_eq!(slots.get("slot_two").unwrap(), "\n");
        assert_eq!(slots.get("slot_three").unwrap(), "Scaffold\nlines\n");
        assert_eq!(slots.get("slot_four").unwrap(), "\n");
    }
}
