"use client";
import React, { useEffect, useState, useRef } from "react";
import socket from "../connect/connection";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function Chatroom() {
  const [mesuser, setMesuser] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [receiveuser, setReceiveuser] = useState("");
  const searchParams = useSearchParams();
  const userName = searchParams.get("user");
  const roomName = searchParams.get("room");
  const [room, setRoom] = useState(roomName);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [maxZoom, setMaxZoom] = useState(2);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const contentEditableRef = useRef(null);
  const imageRef = useRef(null);
  const [isHolding, setIsHolding] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState({ x: 0, y: 0 });
  const [imageDragging, setImageDragging] = useState(false);





  useEffect(() => {
    console.log("1")
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    console.log("Mobile", isMobile)
    setMaxZoom(isMobile ? 10 : 2);
  }, []);
  //console.log("imgaeeee", imagePosition,setImagePosition)
  useEffect(() => {
    console.log("2")
    socket.on("connect", () => {
      console.log("Connected to socket");
    });

    socket.emit("join-room", roomName);

    socket.on("history", (messageshistory) => {
      const filteredMessages = messageshistory.filter(msg => msg.newroom === room);
      setMesuser(filteredMessages);
    });

    socket.on("receive-message", ({ message, userName, images }) => {
      setMesuser(prevMesuser => [
        ...prevMesuser,
        { nmessages: message, ruser: userName, images }
      ]);
      setMessages(prevMessages => [...prevMessages, message]);
      setReceiveuser(userName);
    });

    return () => {
      socket.off("connect");
      socket.off("history");
      socket.off("receive-message");
    };
  }, [roomName, room]);


  useEffect(() => {                      // Centers the image when it is viewed and adjusts the position on window resize.
    console.log("3")
    if (viewingImage) {
      const handleResize = () => {
        console.log("chalaaa")
        if (imageRef.current) {                // check if the image element is available
          // imgRect will be an object containing properties like width and height.
          const imgRect = imageRef.current.getBoundingClientRect();  //getBoundingClientRect() provides the size of the image and its position relative to the viewport.
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const imgWidth = imgRect.width;
          const imgHeight = imgRect.height;
          console.log("check", viewportWidth, viewportHeight)
          console.log("check2", imgWidth, imgHeight)
          console.log("container pos x, y", (viewportWidth - imgWidth) / 2, (viewportHeight - imgHeight) / 2)
          console.log("container pos x, y", (viewportWidth - imgWidth), (viewportHeight - imgHeight))
          setImagePosition({                        // Calculate initial position to center the image
            x: (viewportWidth - imgWidth) / 2,
            y: (viewportHeight - imgHeight) / 2
          });
      
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [viewingImage]);




  useEffect(() => {
    console.log("4")
    const handleScroll = (e) => {
      if (viewingImage) {
        e.preventDefault();
        const zoomChange = e.deltaY < 0 ? 1.1 : 0.9;  // for virtical scroll direction if scroll up increase by 1.1 zoom in and scroll sown with 0.9 zoom out
        setZoom(prevZoom => {
          const newZoom = Math.max(1, Math.min(prevZoom * zoomChange, maxZoom)); // prevzoom is current zoom level it will not go below 1 and above the maxZoom
          return newZoom;
        });
      }
    };

    window.addEventListener('wheel', handleScroll);  // calls the handlescroll when the wheel is moved
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [viewingImage, maxZoom]);


  const insertImageIntoContentEditable = (imageUrl) => {
    if (contentEditableRef.current) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "150px";
      img.style.paddingTop = "2px"; // Add padding to the top
      img.style.paddingBottom = "2px"; // Add padding to the bottom
      // img.style.cursor = "pointer";
      // img.onclick = () => {
      //     setViewingImage(imageUrl);
      //     setZoom(1);
      // };

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentEditableRef.current);
      range.collapse(false);
      range.insertNode(img);
      range.setStartAfter(img);  // Move the cursor after the image
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      contentEditableRef.current.focus();  // Focus the contentEditable element
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (contentEditableRef.current) {  // get the inner Html of the div and set the div to contenteditable = true

      const contentHtml = contentEditableRef.current.innerHTML.trim(); // Trim whitespace from both ends
      const messageData = { message: contentHtml, room, userName };

      // Check if there are any images to process
      if (images.length > 0) {
        const readers = images.map((img) => {
          const reader = new FileReader();         //FileReader is used to read each image file
          return new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(img);           // readAsDataURL converts the file into data URL string
          });
        });
        Promise.all(readers).then((imageResults) => {          // when promise is resolved then executes the callback function .then part
          // Send the message with images included as HTML
          socket.emit("message", { ...messageData, images: imageResults });      // send mwssage data and image data URL (imageresult)
          setMessage("");
          setImages([]);
          setImagePreviews([]);
          contentEditableRef.current.innerHTML = ""; // Clear the contentEditable div
        });
      } else if (contentHtml !== "" && contentHtml.replace(/<[^>]*>/g, '').trim() !== "") {    // to check its valid message or empty html
        // Send the content with text only
        socket.emit("message", messageData);
        setMessage("");
        contentEditableRef.current.innerHTML = ""; // Clear the contentEditable div
      } else {
        return;           // If there's no content and no images, do nothing
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newImages = [...images, ...files];             // creates a array of existing image and newly dropped files
      setImages(newImages);
      const readers = files.map((file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((previews) => {
        setImagePreviews([...imagePreviews, ...previews]);
        previews.forEach((preview) => insertImageIntoContentEditable(preview));     //ittrates over the perview anf insert each emage into the contentEditable div
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = [...images, ...files];
      setImages(newImages);
      const readers = files.map((file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((previews) => {
        setImagePreviews([...imagePreviews, ...previews]);
        previews.forEach((preview) => insertImageIntoContentEditable(preview));
      });
    }
  };


  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setOriginalSize({ width: naturalWidth, height: naturalHeight });
  };


  // we wala
  const handleContentChange = (e) => {
    const contentEditableElement = e.currentTarget;
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange();

    // Save the current cursor position
    const cursorPosition = {
      offset: range.startOffset,
      container: range.startContainer,
    };

    // Function to color URLs in the text
    const colorUrls = (text) => {
      const urlRegex = /https:\/\/([^\/\.]+)\.([^\/\s]+(?:\/[^\s]*)?)/gi;
      return text;
    };

    const processNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Replace text content with colored URLs
        const newTextContent = colorUrls(node.textContent);
        if (newTextContent !== node.textContent) {
          // Replace text node with a new span containing the formatted text
          const newSpan = document.createElement('span');
          newSpan.innerHTML = newTextContent;
          node.replaceWith(...newSpan.childNodes);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName === 'IMG') {
          // Do nothing, preserve <img> tags as HTML
          return;
        } else {
          // Convert element's content to plain text
          const plainText = node.innerText;
    
          // Process the plain text to color URLs
          const coloredText = colorUrls(plainText);
    
          // Replace the element with a new text node containing the colored text
          const newTextNode = document.createTextNode(coloredText);
          node.replaceWith(newTextNode);
        }
      }
    };
    
    // Process the content without replacing the entire innerHTML
    // [Text, Img, text, <div><span>text</span></div>]
    Array.from(contentEditableElement.childNodes).forEach(processNodes);
    


    // Restore cursor position
    const restoreCursor = () => {
      const newRange = document.createRange();
      newRange.setStart(cursorPosition.container, cursorPosition.offset);
      newRange.collapse(true);

      selection.removeAllRanges();
      selection.addRange(newRange);
    };

    restoreCursor();
  };


  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const files = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        files.push(file);
      }
    }

    if (files.length > 0) {
      handleFiles(files);
      e.preventDefault(); // Prevent the default paste behavior
      contentEditableRef.current.focus();  // Maintain focus after pasting
    }
  };

  const handleFiles = (files) => {
    const newImages = [...images, ...files];
    setImages(newImages);

    const readers = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((previews) => {
      setImagePreviews([...imagePreviews, ...previews]);
      previews.forEach((preview) => insertImageIntoContentEditable(preview));
    });
  };

  useEffect(() => {
    const editable = contentEditableRef.current;

    if (editable) {
      editable.addEventListener('paste', handlePaste);

      return () => {
        editable.removeEventListener('paste', handlePaste);
      };
    }
  }, [images]);




  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsHolding(true);
    setDragStartPoint({ x: e.clientX, y: e.clientY });
    setImageDragging(false);
    console.log("Hold chexk", isHolding)
  };

  const handleMouseMove = (e) => {
    if (!isHolding) return;
    console.log("holding check agian",isHolding)

    const dx = e.clientX - dragStartPoint.x;
    const dy = e.clientY - dragStartPoint.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setImageDragging(true);
    }

    if (imageDragging) {
      setImagePosition(prevPosition => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy
      }));
      setDragStartPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    console.log("working")
    if (isHolding && !imageDragging) {
      // This was a click, not a drag
      setZoom(1);
    }
    setIsHolding(false);
    setImageDragging(true);
  };

  useEffect(() => {
    // Add global event listeners
   // window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Cleanup function to remove event listeners
    return () => {
     // window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isHolding, imageDragging]); // Dependencies for the effect


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Prevent the default action for Enter key (adding a new line)
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessage = (text, images) => {
    // const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|(www\.)[^\s]+)[^>]/gi; 
    const urlPattern = /\b(?:https?|ftp|file):\/\/[^\s<>"'()]+(?=\s|$|(?=<))|(?<![\w.-])www\.[^\s<>"'()]+(?=\s|$|(?=<))/gi;
    let parts = [];       // used to store text,link and images
    let lastIndex = 0;
    let match;            // used to store the url patterns

    // Function to add onClick to images in the text and style them as block elements
    const addOnClickToImages = (html) => {
      return html.replace(/<img\s([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi, (match, p1, src, p2) => {
        return `<img ${p1}src="${src}"${p2} style="display:block;cursor:pointer;max-width:100%;max-height:150px;" onclick="window.handleImageClick('${src}')" />`;
      });
    };

    while ((match = urlPattern.exec(text)) !== null) {       // iterates through message searching for URL using the URLPatern
      const url = match[0];
      if (match.index > lastIndex) {                      // if there is text betwwen 2 image it pushes the message in parts array
        parts.push(text.substring(lastIndex, match.index));
      }

      const href = url.startsWith('www.') ? `http://${url}` : url;
      parts.push(
        <a
          key={url}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          {url}
        </a>
      );
      lastIndex = match.index + match[0].length;               //check if there is text after last url match it pushes to parts
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div>
        {parts.map((part, index) => {
          if (typeof part === 'string' && !urlPattern.test(part)) {
            // Render non-URL parts as HTML with onclick for images
            const htmlWithOnClick = addOnClickToImages(part);
            return (
              <span key={index} dangerouslySetInnerHTML={{ __html: htmlWithOnClick }} />
            );
          } else {
            // Render URLs directly
            return part;
          }
        })}
      </div>
    );
  };


  // Global handler for image click
  window.handleImageClick = (src) => {
    // Your logic to handle image click, e.g., set viewing state
    setViewingImage(src);
    setZoom(1);
  };



  return (
    <div className="bg-gradient-to-b from-green-200 to-green-600 h-[100vh]">
      <div className="chatbox">
        <h1>{userName}</h1>
        <div
          className="flex flex-col border-2 justify-end bg-lime-200 border-black w-[30vw] min-w-[820px] h-[90vh] mx-auto mt-4 rounded-3xl"
          style={{
            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
          }}
        >
          <div className="flex flex-col-reverse p-3 mt-5 mr-2 overflow-auto scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-black">
            <div className="flex flex-col gap-3 p-3">
              {mesuser.map((m, i) =>
                m.ruser === userName ? (
                  <div
                    key={i}
                    className="flex flex-col self-end max-w-lg border-2 border-black rounded-md"
                  >
                    <div className="bg-white text-black pl-2 pr-3 py-1 preserve-whitespace rounded-[4px]">
                      {renderMessage(m.nmessages, m.images)}
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex flex-col max-w-lg border-2 border-black word rounded-md w-fit"
                  >
                    <span className="pl-2 pr-3 text-sm font-bold">
                      {m.ruser}
                    </span>
                    <span className="bg-white text-black pl-2 pr-3 py-1 preserve-whitespace h-auto">
                      {renderMessage(m.nmessages, m.images)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} onDrop={handleDrop} onDragOver={handleDragOver}>
            <div className="flex p-3 items-end space-x-1">
              <input
                type="file"
                multiple
                id="fileInput"
                onChange={handleImageChange}
                className="hidden"
              />
              <div

                ref={contentEditableRef}
                contentEditable
                onInput={handleContentChange}
                onDrop={handleDrop}
                onKeyDown={handleKeyDown}
                onDragOver={handleDragOver}
                className="flex-grow bg-white border rounded-lg px-4 py-2"
                placeholder="Type your message..."
                style={{
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  overflowY: 'auto',
                  maxHeight: '150px', // Adjust the max height to fit your needs
                }}
              />
              <label htmlFor="fileInput" className="cursor-pointer flex-shrink-0">
                <Image src="https://www.svgrepo.com/show/490988/attachment.svg" alt="Attachment" width={50} height={50} />
              </label>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg flex-shrink-0">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {viewingImage && (
        <div
          className="image-viewer-overlay"
          onClick={(e) => e.currentTarget === e.target && setViewingImage(null)}
          onMouseUp={handleMouseUp}
        >
          <div
            className="image-viewer-container "
            style={{
            
              // cursor: "pointer",
            }}
            onMouseUp={handleMouseUp}
            onClick={(e) => e.currentTarget === e.target && setViewingImage(null)}
          >
            <img
              ref={imageRef}
              src={viewingImage}
              alt="Viewing"
              className="image-viewer-img"
              style={{
                position: 'absolute',
                top: `${imagePosition.y}px`,
                left: `${imagePosition.x}px`,
                transform: `scale(${zoom})`,
                cursor: isHolding ? 'grabbing' : 'grab',
              }}
    onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
     // onMouseUp={handleMouseUp}
              onLoad={handleImageLoad}
            />
          </div>
        </div>
      )}


    </div>
  );
}

export default Chatroom;
