#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs::File;
use std::io::Error;
use std::io::Read;

use zip::read::ZipFile;
use zip::read::ZipArchive;
use zip::result::ZipError;

use image::ImageError;
use image::io::Reader as ImageReader;

#[tauri::command]
fn extract_image_at(path: String, index: usize) -> Result<Vec<Vec<u8>>, String> {
    let zip_reader: File = File::open(&path).map_err(|e: Error| e.to_string())?;
    let mut zip: ZipArchive<File> = ZipArchive::new(zip_reader).map_err(|e: ZipError| e.to_string())?;

    let mut images: Vec<Vec<u8>> = vec![];

    let mut file: ZipFile<'_> = zip.by_index(index).map_err(|e: ZipError| e.to_string())?;
    if file.name().ends_with(".jpg") || file.name().ends_with(".png") {
        let mut buffer: Vec<u8> = Vec::new();
        file.read_to_end(&mut buffer).map_err(|e: Error| e.to_string())?;

        // Optional: Validate the image
        let _ = ImageReader::new(std::io::Cursor::new(&buffer))
            .with_guessed_format()
            .map_err(|e: Error| e.to_string())?
            .decode()
            .map_err(|e: ImageError| e.to_string())?;

        images.push(buffer);
    }

    Ok(images)
}

#[tauri::command]
fn extract_images(path: String) -> Result<Vec<Vec<u8>>, String> {
    let zip_reader: File = File::open(&path).map_err(|e: Error| e.to_string())?;
    let mut zip: ZipArchive<File> = ZipArchive::new(zip_reader).map_err(|e: ZipError| e.to_string())?;

    let mut images: Vec<Vec<u8>> = vec![];

    for index in 0..zip.len() {
        let mut file: ZipFile<'_> = zip.by_index(index).map_err(|e: ZipError| e.to_string())?;
        if file.name().ends_with(".jpg") || file.name().ends_with(".png") {
            let mut buffer: Vec<u8> = Vec::new();
            file.read_to_end(&mut buffer).map_err(|e: Error| e.to_string())?;

            // Optional: Validate the image
            let _ = ImageReader::new(std::io::Cursor::new(&buffer))
                .with_guessed_format()
                .map_err(|e: Error| e.to_string())?
                .decode()
                .map_err(|e: ImageError| e.to_string())?;

            images.push(buffer);
        }
    }

    Ok(images)
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, extract_image_at, extract_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
