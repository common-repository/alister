import React from "react";
import { Tooltip, Grid, Button, Box, Checkbox } from "@mui/material";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { ImagePopover } from "../../shared/ImagePopover";
import HelpDialog from "../../shared/HelpDialog";
import { ProductGalleryHelpContent } from "../../../utlis";

import "../../../styles/Importer/ProductEditor/ImageGallery.css";

const ImageGallery = (props) => {
  const { images, onChangeImages, size, productId } = props;

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChangeImages(productId, items);
  }

  const handleFileChange = async (event) => {
    let files = event.target.files;
    if (!Array.isArray(files)) {
      files = Object.values(files);
    }

    const newImages = [];

    for (const fl of files) {
      var formData = new FormData();
      formData.append("file", fl);
      formData.append("title", fl.name);

      const response = await jQuery.ajax({
        type: "POST",
        url: "/wp-json/wp/v2/media",
        headers: {
          "X-WP-Nonce": alisterData.nonce,
        },
        processData: false,
        contentType: false,
        data: formData,
      });
      newImages.push({ selected: true, url: response.source_url });
    }

    // Upload file
    onChangeImages(productId, [...images, ...newImages]);
  };

  const handleImageChange = (event, url) => {
    images.forEach((obj) => {
      if (obj.url == url) {
        obj.selected = !obj.selected;
      }
    });
    onChangeImages(productId, [...images]);
  };

  const handleSelectAllImages = (someNewSelected) => {
    images.forEach((obj) => {
      obj.selected = !someNewSelected;
    });
    onChangeImages(productId, [...images]);
  };

  const someNewSelected = images.some((i) => i.selected);

  return (
    <React.Fragment>
      <Grid item xs={12}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="product-editor-label">
            <b>Gallery</b>
          </span>
          <HelpDialog
            title="Product gallery"
            content={ProductGalleryHelpContent}
          ></HelpDialog>
          <Button
            variant="contained"
            size="small"
            component="label"
            style={{
              backgroundColor: "#D0DB7A",
              color: "white",
              fontSize: "0.8vw",
              maxHeight: 30,
              marginLeft: "auto",
              marginRight: 10,
            }}
          >
            ADD
            <input
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={(e) => handleFileChange(e)}
            />
          </Button>
          <Button
            variant="contained"
            onClick={(event) => handleSelectAllImages(someNewSelected)}
            color="primary_ultimus"
          >
            Select All
          </Button>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Box
          className="generic-background-color"
        >
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="newImages" direction="horizontal">
              {(provided) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    overflowX: "auto",
                    padding: "0 0 15px 0"
                  }}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {images?.map((item, index) => (
                    <Draggable
                      key={item.url}
                      draggableId={item.url}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                            }}
                          >
                            <Tooltip
                              title={index == "0" ? "Main product image" : ""}
                            >
                              <ImagePopover
                                imageSource={`${item.url}?w=120&h=120&fit=crop&auto=format`}
                                imageWidth="60"
                                popoverImageWidth="180"
                                index={index}
                              ></ImagePopover>
                            </Tooltip>
                            <Checkbox
                              className="image-checkbox"
                              size="small"
                              style={{ padding: 3 }}
                              checked={item.selected}
                              onChange={(e) => {
                                handleImageChange(e, item.url);
                              }}
                            ></Checkbox>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </Grid>
    </React.Fragment>
  );
};

export default ImageGallery;
