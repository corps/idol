use std::collections::HashMap;

pub fn ordered_by_keys<T>(map: &HashMap<String, T>) -> Vec<(&String, &T)> {
    let mut keys: Vec<&String> = map.keys().collect();
    keys.sort();

    keys.iter().map(|k| (*k, map.get(*k).unwrap())).collect()
}
