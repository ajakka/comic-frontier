import React from "react";
import { dialog } from "@tauri-apps/api";
import { invoke } from '@tauri-apps/api/tauri'
import "./App.css";

function App() {

  const [localPath, setPath] = React.useState<string>();
  const [images, setImages] = React.useState<string[]>([]);
  const [index, setIndex] = React.useState<number>(0);

  const [page, setPage] = React.useState<number>(0);
  const [count, setCount] = React.useState<number>(4);

  async function extractAllImagesFromZip() {
    try {
      let path = "";
      performance.now()
      if (localPath === undefined) {
        path = await dialog.open({ directory: false }) as string;
        // setPath(path);
      }
      else {
        path = localPath;
      }
      console.log("commic path: ", path);

      let startTime = performance.now();
      const imgBuffers: number[][] = await invoke('extract_images', { path });
      let endTime = performance.now();

      console.log("commic buffers toke:", ((endTime - startTime) / 1000) + "s", "and has:", imgBuffers.length, "imgBuffers elements");

      startTime = performance.now();
      const dataUrls = imgBuffers.map(buffer => {
        const imgBlob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
        return URL.createObjectURL(imgBlob);
      });
      endTime = performance.now();
      console.log("commic data-url toke:", ((endTime - startTime) / 1000) + "s", "and has:", dataUrls.length, "dataUrls elements");


      startTime = performance.now();
      setImages(dataUrls);
      endTime = performance.now();
      console.log("setting state toke:", ((endTime - startTime) / 1000) + "s", "and has:", dataUrls.length, "elements");

    } catch (error) {
      console.log(error);
    }
  }

  async function extractImagesFromZip() {
    try {
      const path = await getComicPath();

      const imgBuffers: number[][] = await invoke('extract_image_at', { path, page, count });

      const dataUrls = imgBuffers.map(buffer => {
        const imgBlob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
        return URL.createObjectURL(imgBlob);
      });

      setPage(page + 1)
      setImages([...images, ...dataUrls]);

    } catch (error) {
      console.log(error);
    }
  }

  async function getComicPath() {
    let path = "";

    if (localPath === undefined) {
      path = await dialog.open({ directory: false }) as string;
      setPath(path);
    }
    else {
      path = localPath;
    }

    return path
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
        <p>index: {index}</p>

        <button type="button" onClick={() => extractImagesFromZip()}>
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
        {images.map((src, index) =>
          <img
            key={index}
            src={src}
            loading={"lazy"}
            alt={`Image ${index}`}
            style={{ width: "100%" }} />)}
      </div>
    </div>
  );
}

export default App;
