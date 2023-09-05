import React from "react";

import { dialog } from "@tauri-apps/api";
import { invoke } from '@tauri-apps/api/tauri';

import { Alignment, Button, Classes, Navbar, NavbarDivider, NavbarGroup } from "@blueprintjs/core";


function ReaderScreen(props: any) {

  const [localPath, setPath] = React.useState<string>();


  const [index, setIndex] = React.useState<number>(0);
  const [image, setImage] = React.useState<string>();

  const [total, setTotal] = React.useState<number>(1);

  const [darkTheme, setDarkTheme] = React.useState(true);
  const handleDarkThemeToggle = React.useCallback(
    () => setDarkTheme(!darkTheme),
    [darkTheme]
  );


  async function loadImages() {
    try {
      const path = await dialog.open({ directory: false }) as string;
      setPath(path);
      setIndex(0)

      const totalImages: number = await invoke('load_images', { path });
      setTotal(totalImages);

    } catch (error) {
      console.log(error);
    }
  }

  async function getImageAtStateIndex(newTotal?: number) {
    try {
      if (index >= 0 && index < total) {
        const image: number[] = await invoke('get_image_at', { index });
        const dataUrl = (await convertBuffersToBlobs([image]))[0];

        window.scrollTo(0, 0)
        setImage(dataUrl);
      }
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  React.useEffect(() => {
    getImageAtStateIndex()
  }, [index, total]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }} className={"app " + (darkTheme ? Classes.DARK : "")}>
      {/* TOP MENU */}
      <Navbar style={{ height: 42 }} className={(darkTheme ? Classes.DARK : "")}>
        <NavbarGroup style={{ height: 42 }} align={Alignment.LEFT}>
          <Button
            minimal
            text="Open new comic"
            icon="book"
            onClick={() => void loadImages()}
          />

          <NavbarDivider />

          {total ? <Button
            minimal
            text={`${index + 1}/${total}`}
          /> : <></>}

          {/*<Button icon="code" minimal />
          <NavbarDivider />
          <p>page: {index} </p>
          <NavbarDivider />
          {loadingTime && <p> Loading toke: {loadingTime}</p>} */}


          {/* <NavbarDivider /> */}

          {/* <Switch
          style={{ marginBottom: 0 }}
          className="dark-theme-switch"
          label="Dark theme"
          checked={props.darkTheme}
          onChange={props.onToggleDarkTheme}

        /> */}
        </NavbarGroup>
      </Navbar>

      {/* CONTENT */}
      {/* <Card style={{ flex: 1 }} className={(darkTheme ? Classes.DARK : "")}> */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {image && <img key={index} src={image} alt={`Image ${index}`} style={{ width: "80%", objectFit: "scale-down" }} />}
      </div>
      {/* </Card> */}
    </div>
  )
}

export default ReaderScreen;