#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate lazy_static;
extern crate parking_lot;

use std::time::{Instant, Duration};

use std::fs::File;
use std::io::{Error, Read};

use zip::read::{ZipFile, ZipArchive};
use zip::result::ZipError;

use parking_lot::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    static ref IMAGES: Mutex<Vec<Vec<u8>>> = Mutex::new(Vec::new());
}

#[tauri::command]
async fn load_images(path: String) -> Result<usize, String> {
    let zip_reader: File = File::open(&path).map_err(|e: Error| e.to_string())?;
    let mut zip: ZipArchive<File> = ZipArchive::new(zip_reader).map_err(|e: ZipError| e.to_string())?;

    let mut images: Vec<Vec<u8>> = vec![];

    for index in 0..zip.len() {
        let mut file: ZipFile<'_> = zip.by_index(index).map_err(|e: ZipError| e.to_string())?;
        if file.name().ends_with(".jpg") || file.name().ends_with(".png") {
            let mut buffer: Vec<u8> = Vec::new();
            file.read_to_end(&mut buffer).map_err(|e: Error| e.to_string())?;
            images.push(buffer);
        }
    }

    let mut image_map = IMAGES.lock();
    *image_map = images;

    Ok(image_map.len())
}

#[tauri::command]
async fn get_image_at(index: usize) -> Result<Vec<u8>, String> {
    let images_lock = IMAGES.lock();
    if index < images_lock.len() {
        Ok(images_lock[index].clone())
    } else {
        Err(format!("No image found at index: {}", index))
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_images,
            get_image_at,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
