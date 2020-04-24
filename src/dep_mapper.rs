use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct DepMapper {
    entries: Vec<String>,
    children: Vec<Vec<usize>>,
    parents: Vec<Vec<usize>>,
}

impl Default for DepMapper {
    fn default() -> Self {
        DepMapper::new()
    }
}

impl DepMapper {
    pub fn new() -> DepMapper {
        DepMapper {
            entries: Vec::new(),
            children: Vec::new(),
            parents: Vec::new(),
        }
    }

    pub fn key_entry(&mut self, entry: &str) -> usize {
        let position = self.entries.iter().position(|i| i == &entry);
        if let Some(idx) = position {
            return idx;
        }

        self.children.push(vec![]);
        self.parents.push(vec![]);
        self.entries.push(entry.to_owned());
        return self.children.len() - 1;
    }

    pub fn order_dependencies(&self) -> Vec<String> {
        let mut processing_stack: Vec<(Vec<usize>, &Vec<usize>)> = Vec::new();
        let mut ordered: HashSet<usize> = HashSet::new();
        let mut ordering: Vec<String> = vec![];

        let mut all_entry_keys: Vec<usize> = vec![];
        for i in 0..self.entries.len() {
            all_entry_keys.push(i);
        }

        processing_stack.push((vec![], &all_entry_keys));

        while let Some((path, children)) = processing_stack.last().map(|v| v.to_owned()) {
            let mut found_unresolved_child = false;
            for child in children.iter().cloned() {
                if ordered.contains(&child) || path.contains(&child) {
                    continue;
                }

                if let Some(child_children) = self.children.get(child) {
                    found_unresolved_child = true;
                    let mut new_parent = path.clone();
                    new_parent.push(child);
                    processing_stack.push((new_parent, child_children));
                }
            }

            if !found_unresolved_child {
                processing_stack.pop();
                if let Some(tail) = path.last() {
                    if ordered.contains(tail) {
                        continue;
                    }

                    ordered.insert(tail.to_owned());
                    ordering.push(self.entries.get(tail.to_owned()).unwrap().to_owned())
                }
            }
        }

        return ordering;
    }

    pub fn contains_from(&self, from_dependency: &str) -> bool {
        let idx = self.entries.iter().position(|i| i == &from_dependency);
        idx.map(|idx| self.parents.get(idx).unwrap().len() > 0)
            .unwrap_or(false)
    }

    pub fn add_dependency(
        &mut self,
        from_dependency: &str,
        to_dependency: &str,
    ) -> Result<(), String> {
        if from_dependency == to_dependency {
            return Err(format!(
                "Circular dependency detected: {} <- {}",
                from_dependency, to_dependency
            ));
        }

        let from_key = self.key_entry(from_dependency);
        let to_key = self.key_entry(to_dependency);
        let from_parents = self.parents.get(from_key).unwrap();

        let mut seen_parent: HashSet<usize> = HashSet::new();
        let mut parent_queue: Vec<(usize, Vec<usize>)> = from_parents
            .iter()
            .cloned()
            .map(|e| (e, vec![to_key, from_key, e]))
            .collect();

        while let Some((next_parent, path)) = parent_queue.pop() {
            if next_parent == to_key {
                return Err(format!(
                    "Circular dependency: {}",
                    path.iter()
                        .cloned()
                        .map(|i| self.entries.get(i).unwrap().to_owned())
                        .collect::<Vec<String>>()
                        .join(" <- ")
                ));
            }

            if seen_parent.contains(&next_parent) {
                continue;
            }

            seen_parent.insert(next_parent);

            let parent_of_parents = self.parents.get(next_parent).unwrap();
            for pp in parent_of_parents {
                let mut next_path = path.clone();
                next_path.push(pp.to_owned());
                parent_queue.push((pp.to_owned(), next_path));
            }
        }

        self.parents.get_mut(to_key).map(|v| v.push(from_key));
        self.children.get_mut(from_key).map(|v| v.push(to_key));

        Ok(())
    }
}
