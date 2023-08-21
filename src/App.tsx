import React from "react";
import { dialog, fs } from "@tauri-apps/api";
import { invoke } from '@tauri-apps/api/tauri'
import "./App.css";

function App() {

  const [localPath, setPath] = React.useState<string>();
  const [images, setImages] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState<number>(0);

  async function extractImagesFromZip(index: number) {
    try {
      let path = "";

      if (localPath === undefined) {
        path = await dialog.open({ directory: false }) as string;
        setPath(path);
      }
      else {
        path = localPath;
      }

      const imgBuffers: number[][] = await invoke('extract_image_at', { path, index });

      const dataUrls = imgBuffers.map(buffer => {
        const blob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      });
      setImages(dataUrls);

    } catch (error) {
      console.log(error);
    }
  }

  function prev() {
    if (index > 0) {
      setIndex(index - 1)
      extractImagesFromZip(index - 1)
    }
    else {
      setIndex(0)
      extractImagesFromZip(0)
    }
  }

  function next() {
    setIndex(index + 1)
    extractImagesFromZip(index + 1)
  }

  return (
    <div>
      <div>
        <button type="button" onClick={() => extractImagesFromZip(index)}>
          Select a .cbz file
        </button>
        <button type="button" onClick={() => prev()}>
          Prev
        </button>
        <button type="button" onClick={() => next()}>
          Next
        </button>
      </div>


      <div>
        {images.map((src, index) => <img key={index} src={src} alt={`Image ${index}`} />)}
      </div>
    </div>
  );
}

export default App;
