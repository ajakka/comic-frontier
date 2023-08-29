import React from "react";
import { dialog } from "@tauri-apps/api";
import { invoke } from '@tauri-apps/api/tauri'
import "./App.css";

function App() {
  const [localPath, setPath] = React.useState<string>();


  const [index, setIndex] = React.useState<number>(0);
  const [image, setImage] = React.useState<string>();

  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingTime, setLoadingTime] = React.useState<number>(0);


  async function loadImages() {
    try {
      const path = await getComicPath();
      const totalImages: number = await invoke('load_images', { path });

      setTotal(totalImages);
    } catch (error) {
      console.log(error);
    }
  }

  async function getImageAtStateIndex() {
    try {
      if (index >= 0 && index < total) {
        const image: number[] = await invoke('get_image_at', { index });
        const dataUrl = (await convertBuffersToBlobs([image]))[0];

        setImage(dataUrl);
      }
    } catch (error) {
      console.log(error);
    }
  }


  async function getComicPath() {
    let path = "";
    console.log("localPath", localPath);

    if (localPath === undefined) {
      path = await dialog.open({ directory: false }) as string;
      setPath(path);
    }
    else {
      path = localPath;
    }

    return path
  }

  function convertBuffersToBlobs(imgBuffers: number[][]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // setTimeout(() => {
      let dataUrls: string[] = []
      for (let buffer of imgBuffers) {
        const imgBlob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
        dataUrls.push(URL.createObjectURL(imgBlob));
      }
      resolve(dataUrls);
      // }, 0);
    });
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let newIndex = index;
      if (e.key === 'ArrowRight' && index < total) {
        newIndex = index + 1;
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        newIndex = index - 1;
      }
      setIndex(newIndex);
      setLoading(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  React.useEffect(() => {
    let start = performance.now();

    getImageAtStateIndex()
      .then(_ => {
        setLoading(false);
        setLoadingTime(performance.now() - start)
      });

  }, [index]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <p>page: {index}</p>
        {loading && <p>Loading</p>}
        {loadingTime && <p>Loading toke: {loadingTime}</p>}

        <p>_______________</p>

        <button
          type="button"
          onClick={() => {
            let start = performance.now();

            loadImages()
              .then(_ => getImageAtStateIndex())
              .then(_ => {
                setLoading(false);
                setLoadingTime(performance.now() - start);
              })
          }}>
          Select a .cbz file
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {image && <img
          key={index}
          src={image}
          // loading={"lazy"}
          alt={`Image ${index}`}
          style={{ height: "100vh" }} />}

      </div>
    </div>
  );
}

export default App;
